from __future__ import annotations
import logging
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from .dataset import build
LOG = logging.getLogger(__name__)
DEFAULT = "mistralai/Mistral-7B-Instruct-v0.2"

def train(corpus="data/clean.txt", out="models/rap-lora", base=DEFAULT, epochs=3, batch=1, lr=2e-4):
    from bitsandbytes import BitsAndBytesConfig
    qc = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_use_double_quant=True,
                            bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype="float16")
    tok = AutoTokenizer.from_pretrained(base, use_fast=True)
    tok.pad_token = tok.eos_token
    model = AutoModelForCausalLM.from_pretrained(base, quantization_config=qc)
    model = prepare_model_for_kbit_training(model)
    lcfg=LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj","v_proj","k_proj","o_proj","gate_proj"],
                    lora_dropout=0.05, task_type="CAUSAL_LM")
    model = get_peft_model(model, lcfg)
    ds = build(corpus, tok)
    coll = DataCollatorForLanguageModeling(tok, mlm=False)
    args = TrainingArguments(output_dir=str(out), num_train_epochs=epochs, per_device_train_batch_size=batch,
                             gradient_accumulation_steps=max(1,8//batch), learning_rate=lr, fp16=True,
                             logging_steps=50, save_strategy="epoch", save_total_limit=2, report_to="none")
    trainer = Trainer(model=model, args=args, train_dataset=ds["train"], data_collator=coll)
    trainer.train()
    tok.save_pretrained(out); model.save_pretrained(out)
    LOG.info("Saved adapter to %s", out)
