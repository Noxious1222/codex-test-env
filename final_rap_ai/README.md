# Final Rap AI

Command line tool for scraping lyrics, preprocessing text, training a language model with LoRA, and generating rap verses.

## Installation

Install the required Python packages. Internet access is required to download them from PyPI:

```bash
pip install -r requirements.txt
```

## Usage

The `cli.py` script exposes four commands:

* `scrape` - Download song lyrics from the Genius API.
* `prep` - Clean up the raw lyrics and collapse repeated lines.
* `train` - Fine-tune the base model using LoRA adapters.
* `gen` - Generate new lyrics from a trained model.

Example workflow:

```bash
# 1. Scrape lyrics (requires GENIUS_TOKEN env var)
python cli.py scrape --artists "Artist Name" --out data/raw.txt

# 2. Preprocess the text
python cli.py prep --in data/raw.txt --out data/clean.txt

# 3. Train an adapter
python cli.py train --corpus data/clean.txt --out models/rap-lora

# 4. Generate text
python cli.py gen --model-dir models/rap-lora --prompt "<INTRO>\n"
```
