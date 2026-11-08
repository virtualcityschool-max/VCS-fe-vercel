#!/usr/bin/env python3
"""Parse Cambridge zone timetable PDFs into src/data/examTimetable/ (June 2027 run).

Usage: download the zone PDFs (zone-1.pdf ... zone-6.pdf, zone-3-uk.pdf) into a
folder, then `python3 scripts/parse-cambridge-timetable.py <folder>`; it writes
<folder>/parsed.json, from which the data files were generated. Needs pdftotext.

Source A: the "Syllabus view (A-Z)" section (one row per paper with its date).
Source B: the "Weekly view" section (rows grouped under day headings).
Every paper must appear in both with the same date and session, or we stop.
"""
import json, re, subprocess, sys
from pathlib import Path

D = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent
ZONES = ["zone-1", "zone-2", "zone-3", "zone-3-uk", "zone-4", "zone-5", "zone-6"]
MONTHS = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 1)}
DAYS = "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday"
LEVELS = [  # heading text in the syllabus view -> short key (weekly view prefix)
    ("Cambridge IGCSE (9–1)", "9-1"),
    ("Cambridge IGCSE", "IG"),
    ("Cambridge O Level", "OL"),
    ("Cambridge International AS Level", "AS"),
    ("Cambridge International A Level", "AL"),
]
DUR = r"((?:\d+h)?\s*(?:\d+m)?)"


def tidy(s):
    s = re.sub(r"(?<=[a-z\)])(?=[A-Z(])", " ", s)  # "MultipleChoice" -> "Multiple Choice"
    s = re.sub(r"&(?=\S)", "& ", s)
    s = re.sub(r"\s*-\s*(?=[A-Z])", " - ", s)  # "Practical -Advanced" -> "Practical - Advanced"
    s = re.sub(r"\s+", " ", s).strip()
    return s.replace("an Additional", "an Additional")


def iso(day, month):
    return f"2027-{MONTHS[month]:02d}-{int(day):02d}"


def raw(zone):
    return subprocess.run(["pdftotext", "-raw", str(D / f"{zone}.pdf"), "-"], capture_output=True, text=True, check=True).stdout


ROW = re.compile(rf"^(.*?)\s*(\d{{4}}/\d{{2}})\s+{DUR}\s+({DAYS})\s*(\d{{1,2}})\s*([A-Z][a-z]+)\s*2027\s+(AM|PM|EV)$")
WIN = re.compile(r"^(.*?)\s*(\d{4}/\d{2})\s+(\d{2})/(\d{2})/2027\s*[–-]\s*(\d{2})/(\d{2})/2027$")
WROW = re.compile(rf"^(IG|OL|AS|AL|9–1)\s+(.*?)\s*(\d{{4}}/\d{{2}})\s+{DUR}\s+(AM|PM|EV)$")
WDAY = re.compile(rf"^({DAYS})\s*(\d{{1,2}})\s*([A-Z][a-z]+)$")


def layout(zone):
    return subprocess.run(["pdftotext", "-layout", str(D / f"{zone}.pdf"), "-"], capture_output=True, text=True, check=True).stdout


WLROW = re.compile(rf"(IG|OL|AS|AL|9[–-]1)\s+(.*?)\s*(\d{{4}}/\d{{2}})\s+{DUR}\s+(AM|PM|EV)\b")
WLDAY = re.compile(rf"^({DAYS}) (\d{{1,2}}) ([A-Z][a-z]+)$")


def parse(zone):
    rlines = [l.strip() for l in raw(zone).splitlines()]
    text = "\n".join(rlines)
    version = re.search(r"(Version \d+, [A-Z][a-z]+ 20\d\d)", text).group(1)
    final = "This is the final" in text

    # --- test date windows + source A (syllabus view rows carry their own date) ---
    windows, rows, pending = [], [], ""
    for l in rlines:
        m = WIN.match(l)
        if m:
            windows.append({"code": m.group(2), "name": tidy(m.group(1)), "from": f"2027-{m.group(4)}-{m.group(3)}", "to": f"2027-{m.group(6)}-{m.group(5)}"})
            pending = ""
            continue
        m = ROW.match(l)
        if m:
            rows.append({"code": m.group(2), "rawName": tidy((pending + " " + m.group(1)).strip()), "duration": re.sub(r"\s+", " ", m.group(3)).strip(), "date": iso(m.group(5), m.group(6)), "session": m.group(7)})
            pending = ""
        elif re.search(r"\d{4}/\d{2}", l) or re.match(r"^[A-Z]$", l) or not l:
            pending = ""
        elif re.match(r"^[A-Z][A-Za-z&' ,.()-]*\($|^[A-Z][A-Za-z&' ,.()-]*$", l) and len(l) < 60:
            pending = l  # possible first half of a wrapped name
        else:
            pending = ""

    # --- source B: weekly view, from the page layout ---
    week, cur = {}, None
    ll = layout(zone).splitlines()
    for i, l in enumerate(ll):
        t = l.strip()
        d = WLDAY.match(t)
        if d:
            cur = iso(d.group(2), d.group(3))
            continue
        for m in WLROW.finditer(l):
            code = m.group(3)
            if code in week:
                raise SystemExit(f"{zone}: {code} twice in weekly view")
            name = re.sub(r"\s+", " ", m.group(2)).strip()
            if not name:  # long name wrapped onto the lines above and below the row
                a0, a1 = m.start(1) + 2, m.start(3)
                name = " ".join(x[a0:a1].strip() for x in (ll[i - 1], ll[i + 1]) if x[a0:a1].strip())
                name = re.sub(r"\s+", " ", name)
            week[code] = {"date": cur, "session": m.group(5), "level": "9-1" if m.group(1).startswith("9") else m.group(1), "name": name, "duration": re.sub(r"\s+", " ", m.group(4)).strip()}

    # --- cross-check A against B: date, session and duration must agree ---
    a = {r["code"]: r for r in rows}
    if len(a) != len(rows):
        raise SystemExit(f"{zone}: duplicate codes in syllabus view")
    only_a, only_b = sorted(set(a) - set(week)), sorted(set(week) - set(a))
    diff = sorted(c for c in set(a) & set(week) if (a[c]["date"], a[c]["session"], a[c]["duration"]) != (week[c]["date"], week[c]["session"], week[c]["duration"]))
    if only_a or only_b or diff:
        raise SystemExit(f"{zone}: MISMATCH only-syllabus={only_a[:8]} only-weekly={only_b[:8]} differ={[(c, a[c]['date'], a[c]['session'], a[c]['duration'], week[c]) for c in diff[:5]]}")
    papers = []
    for c, w in week.items():
        name = w["name"] if w["name"].count("(") == w["name"].count(")") else a[c]["rawName"]
        papers.append({"level": w["level"], "code": c, "name": name, "duration": w["duration"], "date": w["date"], "session": w["session"]})
    papers.sort(key=lambda r: (r["date"], {"AM": 0, "PM": 1, "EV": 2}[r["session"]], r["code"]))
    # window levels: from the level headings on the test-windows page(s)
    wl, cur = {}, None
    for l in layout(zone).split("Weekly view")[0].splitlines() if False else layout(zone).splitlines():
        t = l.strip()
        head = next((k for h, k in LEVELS if t in (h, h + " Continued", h.replace("–", "-"))), None)
        if head:
            cur = head
        for c in re.findall(r"(\d{4}/\d{2})\s+\d{2}/\d{2}/2027", l):
            wl.setdefault(c, cur)
        if WLDAY.match(t):
            break  # weekly view starts
    for wdw in windows:
        wdw["level"] = wl.get(wdw["code"])
        if not wdw["level"]:
            raise SystemExit(f"{zone}: no level for window {wdw['code']}")
    return {"zone": zone, "version": version, "final": final, "papers": papers, "windows": windows}


if __name__ == "__main__":
    out = {}
    for z in ZONES:
        p = parse(z)
        out[z] = p
        lv = {}
        for r in p["papers"]:
            lv[r["level"]] = lv.get(r["level"], 0) + 1
        print(f"{z}: {p['version']} final={p['final']} papers={len(p['papers'])} {lv} windows={len(p['windows'])} first={p['papers'][0]['date']} last={p['papers'][-1]['date']}")
    (D / "parsed.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
