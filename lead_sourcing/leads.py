#!/usr/bin/env python3
"""Weekly new-business lead sourcing from Companies House.

Usage:
    export COMPANIES_HOUSE_API_KEY=your-key
    python3 leads.py                 # last 14 days, Preston + Manchester
    python3 leads.py --days 7 --locations Preston Manchester Bolton
    python3 leads.py --no-web-check  # skip website lookups (faster)

Outputs leads_YYYY-MM-DD.csv and leads_YYYY-MM-DD.md in ./output.
Standard library only.
"""
import argparse, base64, csv, json, os, re, socket, sys, time
import urllib.error, urllib.parse, urllib.request
from datetime import date, timedelta
from pathlib import Path

API = "https://api.company-information.service.gov.uk"
SEEN_FILE = Path(__file__).parent / "seen_companies.json"
OUT_DIR = Path(__file__).parent / "output"

# SIC codes likely to need a website quickly (trades, retail, hospitality,
# professional services, consultancy, personal services).
SIC_PREFIXES = [
    "41", "42", "43",            # construction & specialised trades
    "45",                         # motor trades
    "47",                         # retail
    "55", "56",                   # accommodation, food & drink
    "68",                         # estate agents / property services (not 68100 holding-ish handled below)
    "69", "70", "71", "73", "74", # legal/accounts, consultancy, architecture, marketing, design/photo
    "77", "78", "79", "81", "82", # rental, recruitment, travel, cleaning/landscaping, admin support
    "85",                         # education / tutoring
    "86", "87", "88",             # health & care
    "90", "93",                   # arts, sport & fitness
    "95", "96",                   # repairs, hair/beauty/personal services
]
# Never target: holding / dormant / shell types.
EXCLUDE_SIC = {"64201", "64202", "64203", "64204", "64205", "64209", "64301", "64302",
               "64303", "64304", "64305", "64306", "64910", "64921", "64922", "64929",
               "64991", "64992", "64999", "66300", "70100", "74990", "98000", "98100",
               "99999", "99000"}
FORMATION_AGENT_HINTS = [
    "20-22 wenlock", "71-75 shelton", "128 city road", "27 old gloucester",
    "kemp house", "suite", "po box", "virtual office", "1 st peters square",
    "c/o", "care of", "registered office address", "international house",
    "167-169 great portland", "85 great portland", "3rd floor, 86-90 paul",
    "retford", "mailbox", "unit 3a, 34-35 hatton",
]


def call(path, key, params=None, retries=4):
    url = API + path + ("?" + urllib.parse.urlencode(params, doseq=True) if params else "")
    auth = base64.b64encode(f"{key}:".encode()).decode()
    req = urllib.request.Request(url, headers={"Authorization": f"Basic {auth}"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:  # 600 requests / 5 min
                time.sleep(30 * (attempt + 1)); continue
            if e.code == 404:
                return None
            if e.code == 401:
                sys.exit("Companies House rejected the API key (401). Check COMPANIES_HOUSE_API_KEY.")
            raise
        except (urllib.error.URLError, socket.timeout):
            time.sleep(2 ** attempt)
    return None


def fetch_companies(key, days, locations):
    today = date.today()
    found = {}
    for loc in locations:
        start = 0
        while True:
            data = call("/advanced-search/companies", key, {
                "incorporated_from": (today - timedelta(days=days)).isoformat(),
                "incorporated_to": today.isoformat(),
                "company_status": "active",
                "location": loc,
                "size": 100,
                "start_index": start,
            })
            items = (data or {}).get("items", [])
            for c in items:
                found[c["company_number"]] = c
            start += 100
            if len(items) < 100:
                break
    return list(found.values())


def sic_ok(sics):
    if not sics:
        return False, []
    if any(s in EXCLUDE_SIC for s in sics):
        return False, sics
    return any(s.startswith(p) for s in sics for p in SIC_PREFIXES), sics


def address_text(c):
    a = c.get("registered_office_address", {}) or {}
    parts = [a.get(k) for k in ("address_line_1", "address_line_2", "locality", "region", "postal_code")]
    return ", ".join(p for p in parts if p)


def looks_like_formation_agent(addr):
    low = addr.lower()
    return any(h in low for h in FORMATION_AGENT_HINTS)


def directors(key, number):
    data = call(f"/company/{number}/officers", key) or {}
    names = [o["name"] for o in data.get("items", [])
             if o.get("officer_role") == "director" and not o.get("resigned_on")]
    return "; ".join(names)


def tidy_name(name):
    n = re.sub(r"\b(ltd|limited|llp|plc)\b\.?", "", name, flags=re.I)
    return re.sub(r"[^a-z0-9]", "", n.lower())


def domain_resolves(domain):
    try:
        socket.gethostbyname(domain)
        return True
    except OSError:
        return False


def web_presence(name):
    """Return list of evidence strings; empty list => nothing found."""
    evidence = []
    slug = tidy_name(name)
    if slug:
        for tld in (".co.uk", ".com", ".uk"):
            if domain_resolves(slug + tld):
                evidence.append(f"domain {slug}{tld} resolves")
                break
    base = re.sub(r"\b(ltd|limited)\b", "", name, flags=re.I).strip()
    try:
        q = urllib.parse.quote(f'"{base}" website')
        req = urllib.request.Request(f"https://html.duckduckgo.com/html/?q={q}",
                                     headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", "ignore")
        hits = re.findall(r'class="result__a"[^>]*>(.*?)</a>', html, flags=re.S)
        text = " ".join(re.sub("<[^>]+>", "", h) for h in hits).lower()
        if tidy_name(base) and base.lower() in text:
            evidence.append("search results mention the name")
        if re.search(r"linkedin\.com|facebook\.com|instagram\.com|google\.com/maps", html.lower()) \
                and base.lower() in html.lower():
            evidence.append("social/maps listing possible")
    except Exception:
        evidence.append("search unavailable")
    time.sleep(1.5)
    return evidence


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=14)
    ap.add_argument("--locations", nargs="+", default=["Preston", "Manchester"])
    ap.add_argument("--no-web-check", action="store_true")
    ap.add_argument("--include-seen", action="store_true", help="don't hide companies from earlier runs")
    args = ap.parse_args()

    key = os.environ.get("COMPANIES_HOUSE_API_KEY")
    if not key:
        sys.exit("Set COMPANIES_HOUSE_API_KEY (free key: developer.company-information.service.gov.uk)")

    seen = set(json.loads(SEEN_FILE.read_text())) if SEEN_FILE.exists() else set()
    companies = fetch_companies(key, args.days, args.locations)
    print(f"{len(companies)} active companies incorporated in last {args.days} days")

    rows = []
    for c in companies:
        num = c["company_number"]
        if num in seen and not args.include_seen:
            continue
        ok, sics = sic_ok(c.get("sic_codes"))
        if not ok:
            continue
        addr = address_text(c)
        if looks_like_formation_agent(addr):
            continue
        notes = []
        if not args.no_web_check:
            ev = web_presence(c["company_name"])
            real = [e for e in ev if e != "search unavailable"]
            if real:
                continue  # already has a presence -> lower urgency
            notes.append("no website found" if not ev else "no website found (web search unavailable, verify manually)")
        else:
            notes.append("web presence not checked")
        notes.append("local address, not a formation agent")
        rows.append({
            "company_name": c["company_name"], "company_number": num,
            "incorporation_date": c.get("date_of_creation", ""),
            "registered_address": addr,
            "sic_codes": ", ".join(sics),
            "directors": directors(key, num),
            "why_flagged": "; ".join(notes),
        })
        seen.add(num)

    rows.sort(key=lambda r: r["incorporation_date"], reverse=True)
    OUT_DIR.mkdir(exist_ok=True)
    stem = OUT_DIR / f"leads_{date.today().isoformat()}"
    cols = list(rows[0].keys()) if rows else ["company_name"]
    with open(stem.with_suffix(".csv"), "w", newline="") as f:
        w = csv.DictWriter(f, cols); w.writeheader(); w.writerows(rows)
    with open(stem.with_suffix(".md"), "w") as f:
        f.write(f"# New business leads ({date.today()})\n\n")
        f.write("| Company | No. | Incorporated | Address | SIC | Director(s) | Why flagged |\n|---|---|---|---|---|---|---|\n")
        for r in rows:
            f.write("| " + " | ".join(r[k] or "" for k in cols) + " |\n")
    SEEN_FILE.write_text(json.dumps(sorted(seen)))
    print(f"{len(rows)} leads -> {stem}.csv / .md")


if __name__ == "__main__":
    main()
