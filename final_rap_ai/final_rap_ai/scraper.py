from __future__ import annotations
import re, time, logging
from pathlib import Path
from typing import List
import lyricsgenius

LOG = logging.getLogger(__name__)
SECTION_RE = re.compile(r"^\s*\[[^\]]+\]\s*$", re.MULTILINE)

def clean(txt: str) -> str:
    txt = SECTION_RE.sub("", txt)
    return re.sub(r"\s+", " ", txt).strip()

def scrape(artists: List[str], token: str, out_file: str | Path = "data/raw.txt", max_songs: int = 200):
    out = Path(out_file); out.parent.mkdir(parents=True, exist_ok=True)
    genius = lyricsgenius.Genius(token, sleep_time=0, retries=3, remove_section_headers=False)
    with out.open("w", encoding="utf-8") as fh:
        for artist in artists:
            LOG.info("Scraping %s", artist)
            a = genius.search_artist(artist, max_songs=max_songs, sort="popularity", get_full_info=False)
            for song in a.songs:
                if song.lyrics:
                    txt = clean(song.lyrics)
                    if len(txt.split()) >= 40:
                        fh.write(txt + "\n")
                        time.sleep(0.3)
    LOG.info("Saved scraped lyrics to %s", out)
