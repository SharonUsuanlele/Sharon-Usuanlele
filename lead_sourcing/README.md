# New business lead sourcing

Finds newly incorporated, active UK companies (Preston + Manchester by default) in
service/trade/retail SIC codes, drops formation-agent addresses and companies that
already have a web presence, and writes a lead list (CSV + Markdown), newest first.

## Setup (once)
1. Register free at https://developer.company-information.service.gov.uk, create an
   application, then a **REST** API key.
2. `export COMPANIES_HOUSE_API_KEY=<key>`

## Run weekly
    python3 lead_sourcing/leads.py --days 7
Options: `--days N`, `--locations Preston Manchester Bolton ...`, `--no-web-check`,
`--include-seen`. Companies already listed in earlier runs are hidden
(tracked in `seen_companies.json`).

## Notes
- Web check = domain guesses + DuckDuckGo search; verify promising leads by hand.
- Company data is public, but follow UK PECR/GDPR rules when contacting (B2B
  contact is fine for corporate subscribers; give an opt-out).
