# export_artifacts.py — export report

- version: **v1**
- data_hash (sha256 of master): `0ef288cebf565418a44891140c6f56faee0681fc50b2ee0e70a94af125a0ea4a`
- master: `coded_5/master_coded.csv`  ·  tables: `tables/`  ·  out: `frontend/public/data/`

## Layer partition (the site = non-contemporary)
- historical: **6504**  ·  undated: **1256**  ·  site total: **7760**
- excluded (contemporary): **3**  ·  all layers: **7763**

## Files
| file | rows | raw bytes | gzip bytes |
|---|---:|---:|---:|
| completeness.json | 7760 | 2,683,954 | 41,895 |
| geo.json | 3359 | 843,210 | 25,330 |
| settlements.json | 5119 | 629,950 | 70,868 |
| matrix.json | 53 | 5,704 | 680 |
| bboxes.json | 117 | 25,870 | 4,131 |
| labels.json | 99 | 8,125 | 2,729 |
| stats.json | - | 2,484 | 1,013 |
| meta.json | - | 1,222 | 633 |
| scenes/openers.json | 5 | 5,095 | 1,648 |
| scenes/makers.json | 23 | 3,503 | 644 |
| scenes/visibility.json | 14 | 5,620 | 1,389 |

### Per-file rows vs table rows
- completeness.json 7760 vs completeness.csv site 7760 (all 7763)
- geo.json 3359 vs geo.csv site 3359 (all 3359)
- settlements.json 5119 vs settlements.csv 5119
- excluded contemporary: 3

## Openers verification
- context     `berlin_smb:49537` — resolved=True, designated-field-missing=True
- maker       `leiden:3188242` — resolved=True, designated-field-missing=True
- place       `commons:20124554` — resolved=True, designated-field-missing=True
- time        `berlin_smb:49486` — resolved=True, designated-field-missing=True
- visibility  `meca:GB165-0229:A4/746` — resolved=True, designated-field-missing=True

## Labels coverage
- geo.json cities lacking city_ar: **0**
- label gaps (region/province/form/tier): **0**

## stats.json (in full)
```json
{
  "absence": {
    "maker_absent": {
      "n": 1438,
      "pct": 18.5
    },
    "not_viewable": {
      "n": 6480,
      "pct": 83.5
    },
    "undated": {
      "n": 1256,
      "pct": 16.2
    },
    "unplaced": {
      "n": 1864,
      "pct": 24.0
    }
  },
  "attribution_gap": {
    "known_collector": 6935,
    "known_collector_maker_absent": 1148,
    "pct": 16.6
  },
  "contested": 12,
  "formulas": {
    "absence.*": "count and 1-dp percentage of the site pool where the form flag == 0 (place/date/maker/visible).",
    "attribution_gap.pct": "site records with a known collector (collector_raw non-empty) whose flag_maker == 0, over site records with a known collector.",
    "contested": "site records with attribution_basis == 'contested'.",
    "per_decade": "site record count per decade; undated -> 'no-date'.",
    "per_region": "site record count per historical region; non-canonical region labels collapse into 'unplaced'.",
    "point_mappable": "site records that resolved to a coordinate (geo.json rows).",
    "score_distribution": "count of site records per 0-4 completeness score.",
    "totals.excluded_contemporary": "records with layer == contemporary.",
    "totals.site": "records with layer != contemporary (historical + undated).",
    "viewable_pool": "site records with flag_visible == 1."
  },
  "per_archive": {
    "Ethnologisches Museum, Berlin (SMB)": 34,
    "Leiden University Libraries": 265,
    "Library of Congress": 153,
    "Middle East Centre Archive (MECA), St Antony's College, Oxford": 3825,
    "Pitt Rivers Museum (Wilfred Thesiger Collection), University of Oxford": 2590,
    "Wikimedia Commons": 893
  },
  "per_decade": {
    "1810s": 1,
    "1820s": 2,
    "1830s": 3,
    "1840s": 1,
    "1850s": 16,
    "1860s": 3,
    "1870s": 9,
    "1880s": 303,
    "1890s": 10,
    "1900s": 204,
    "1910s": 730,
    "1920s": 335,
    "1930s": 1244,
    "1940s": 2750,
    "1950s": 358,
    "1960s": 419,
    "1970s": 88,
    "1980s": 27,
    "1990s": 1,
    "no-date": 1256
  },
  "per_region": {
    "Asir": 697,
    "Eastern Province": 609,
    "Hejaz": 1914,
    "Najd": 475,
    "Northern Borders": 43,
    "unplaced": 4022
  },
  "point_mappable": 3359,
  "score_distribution": {
    "0": 202,
    "1": 1217,
    "2": 1091,
    "3": 4397,
    "4": 853
  },
  "totals": {
    "all_layers": 7763,
    "excluded_contemporary": 3,
    "historical": 6504,
    "site": 7760,
    "undated": 1256
  },
  "viewable_pool": 1280
}
```

## Acceptance checks
- ✅ 1. completeness.json rows == site rows in completeness.csv — 7760 vs 7760
- ✅ 1. geo.json rows == site geo rows — 3359 vs 3359
- ✅ 1. excluded count == contemporary rows in table — 3
- ✅ 1. zero contemporary ids in per-record files — comp=0 geo=0
- ✅ 2. stats.json figures match independent recompute
- ✅ 3. matrix.json cell n-sum == site rows — 7760 vs 7760
- ✅ 3. matrix.json viewable-sum == viewable pool — 1280 vs 1280
- ✅ 4. openers: all ids resolve — ok
- ✅ 4. openers: each designated field verifiably missing — ok
- ✅ 4. openers: no two from the same record — {}
- ✅ 4. openers: exactly 5 forms — 5 forms
- ✅ 5. every geo.json city has city_ar — ok
- ✅ 5. all region/province/form/tier labels present & non-empty — ok
- ✅ 6. completeness.json documents its key map
- ✅ 6. geo.json documents its key map
- ✅ 7. no file over 4 MB raw — ok
- ✅ 9. meta attributions include GeoNames + ODbL
