# FreightGenie — Phase 2 Analytics

## Setup
```bash
cd analytics
pip install -r requirements.txt
```

## Run Analysis
```bash
python3 analysis.py
```

## Output
- `charts/` — 6 PNG charts
- `insights.json` — business insights + stats

## Charts Generated
1. `01_route_analysis.png`     — Top routes by volume
2. `02_cargo_type.png`         — Cargo type distribution
3. `03_monthly_trend.png`      — Monthly volume + score trend
4. `04_compliance_score.png`   — Score distribution + boxplot
5. `05_missing_docs.png`       — Risk levels + missing docs pattern
6. `06_shipping_mode.png`      — Sea/Air/Road breakdown

## Data Source
CSV: `backend/analytics/shipment_analytics.csv`
Auto-saved every time a compliance report is approved.
