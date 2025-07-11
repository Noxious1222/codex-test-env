from datasets import load_dataset
from pathlib import Path
def build(path, tokenizer, block=128, num_proc=4):
    path = Path(path)
    ds = load_dataset("text", data_files=str(path))
    tok = ds.map(
        lambda b: tokenizer(b["text"]),
        batched=True,
        num_proc=num_proc,
        remove_columns=["text"],
    )
    tok = tok.remove_columns([c for c in tok["train"].column_names if c != "input_ids"])
    def group(b):
        concat = sum(b["input_ids"], [])
        n = len(concat)//block*block
        concat = concat[:n]
        return {"input_ids":[concat[i:i+block] for i in range(0,n,block)]}
    return tok.map(group, batched=True, num_proc=num_proc)
