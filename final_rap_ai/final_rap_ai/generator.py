from __future__ import annotations
import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForCausalLM
def generate(model_dir="models/rap-lora", prompt="<INTRO>\n", max_new=400, temp=0.7, top_p=0.9, rep=1.2):
    tok = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForCausalLM.from_pretrained(model_dir, device_map="auto")
    ids = tok(prompt, return_tensors="pt").input_ids.to(model.device)
    out = model.generate(ids, do_sample=True, max_new_tokens=max_new, temperature=temp, top_p=top_p,
                         repetition_penalty=rep, no_repeat_ngram_size=4, pad_token_id=tok.eos_token_id)
    return tok.decode(out[0], skip_special_tokens=True)
