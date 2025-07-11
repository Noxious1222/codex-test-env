from __future__ import annotations
import re, itertools, unicodedata, logging
from pathlib import Path
LOG = logging.getLogger(__name__)
HDR = re.compile(r"^\s*\[([^\]]+)\]\s*$")
MAP = {"intro":"<INTRO>","verse":"<VERSE>","chorus":"<CHORUS>","hook":"<CHORUS>","bridge":"<BRIDGE>","outro":"<OUTRO>"}

def tag(line: str):
    m = HDR.match(line)
    if m:
        key = m.group(1).lower()
        for k,t in MAP.items():
            if k in key:
                return t
    return None

def preprocess(inp: str|Path, out: str|Path="data/clean.txt", max_repeat: int = 2):
    inp, out = Path(inp), Path(out)
    lines=[]
    for raw in inp.read_text(encoding="utf-8", errors="ignore").splitlines():
        raw = unicodedata.normalize("NFKC", raw)
        t = tag(raw)
        if t:
            lines.append(t); continue
        txt = re.sub(r"\s+", " ", raw).strip()
        if txt: lines.append(txt)
    collapsed=[]
    for k,g in itertools.groupby(lines):
        collapsed.extend([k]*min(len(list(g)), max_repeat))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(collapsed), encoding="utf-8")
    LOG.info("Preprocessed -> %s (%d lines)", out, len(collapsed))
