#!/usr/bin/env python3
"""Transform the reference peptide CSV into a typed peptide-library.ts module.

One-shot generator for the prototype: maps CSV rows onto the catalog product ids
already defined in seed-clinic.ts, dedupes (keeping the row with the richest
interaction data), and resolves interaction targets to product ids where we
carry them. Run from the repo root:

    python3 scripts/gen_peptide_library.py
"""
import csv
import json
import re

CSV = "/Users/michaelzhu/Downloads/library_peptides_rows-2.csv"
OUT = "packages/mock-data/src/peptide-library.ts"

# CSV display name -> catalog product id. Covers every product in the catalog.
NAME_TO_ID = {
    "NAD+": "prod_nad",
    "Cagrilintide": "prod_cagrilintide",
    "Sermorelin": "prod_sermorelin",
    "AHK-Cu": "prod_ahkcu",
    "Retatrutide": "prod_retatrutide",
    "AOD-9604": "prod_aod9604",
    "Melanotan II": "prod_melanotan2",
    "GHK-Cu": "prod_ghkcu",
    "Semaglutide": "prod_semaglutide",
    "Dihexa": "prod_dihexa",
    "Pinealon": "prod_pinealon",
    "Thymosin Alpha 1": "prod_thymosin_a1",
    "Thymosin Beta-4": "prod_thymosin_b4",
    "KPV": "prod_kpv",
    "IGF-1 LR3": "prod_igf1lr3",
    "Epitalon": "prod_epitalon",
    "LL-37": "prod_ll37",
    "5-Amino-1MQ": "prod_5amino1mq",
    "Ipamorelin": "prod_ipamorelin",
    "Semax": "prod_semax",
    "Selank": "prod_selank",
    "SS-31": "prod_ss31",
    "Survodutide": "prod_survodutide",
    "BPC-157": "prod_bpc157",
    "MK-677": "prod_mk677",
    "TB-500": "prod_tb500",
    "Tesamorelin": "prod_tesamorelin",
    "Tirzepatide": "prod_tirzepatide",
    "CJC-1295 with DAC": "prod_cjc1295_dac",
    "Melanotan I": "prod_melanotan1",
    "SNAP-8": "prod_snap8",
    "DSIP": "prod_dsip",
    "Glutathione": "prod_glutathione",
    "HGH": "prod_hgh",
    "MOTS-c": "prod_motsc",
    "CJC-1295 (without DAC)": "prod_cjc_ipa",
    "PEG-MGF": "prod_pegmgf",
}

# Catalog display names, for resolving interaction targets back to product ids.
ID_TO_DISPLAY = {
    "prod_semaglutide": "Semaglutide",
    "prod_tirzepatide": "Tirzepatide",
    "prod_retatrutide": "Retatrutide",
    "prod_cagrilintide": "Cagrilintide",
    "prod_survodutide": "Survodutide",
    "prod_tesamorelin": "Tesamorelin",
    "prod_aod9604": "AOD-9604",
    "prod_5amino1mq": "5-Amino-1MQ",
    "prod_bpc157": "BPC-157",
    "prod_tb500": "TB-500",
    "prod_cjc_ipa": "CJC-1295 / Ipamorelin",
    "prod_thymosin_a1": "Thymosin Alpha-1",
    "prod_thymosin_b4": "Thymosin Beta-4",
    "prod_ll37": "LL-37",
    "prod_kpv": "KPV",
    "prod_pegmgf": "PEG-MGF",
    "prod_ghkcu": "GHK-Cu",
    "prod_melanotan2": "Melanotan II",
    "prod_melanotan1": "Melanotan I",
    "prod_snap8": "SNAP-8",
    "prod_glutathione": "Glutathione",
    "prod_ahkcu": "AHK-Cu",
    "prod_nad": "NAD+",
    "prod_epitalon": "Epitalon",
    "prod_motsc": "MOTS-c",
    "prod_ss31": "SS-31",
    "prod_mk677": "MK-677",
    "prod_sermorelin": "Sermorelin",
    "prod_ipamorelin": "Ipamorelin",
    "prod_cjc1295_dac": "CJC-1295 with DAC",
    "prod_igf1lr3": "IGF-1 LR3",
    "prod_hgh": "HGH",
    "prod_semax": "Semax",
    "prod_selank": "Selank",
    "prod_dihexa": "Dihexa",
    "prod_pinealon": "Pinealon",
    "prod_dsip": "DSIP",
}


def norm(s):
    """Loose normalization for fuzzy name matching."""
    s = s.lower()
    s = re.sub(r"\(.*?\)", "", s)  # drop parentheticals
    s = re.sub(r"[^a-z0-9]", "", s)
    return s


# Build a normalized-name -> product id index, plus a few aliases the
# interaction column uses that don't match a catalog display name exactly.
NORM_INDEX = {norm(display): pid for pid, display in ID_TO_DISPLAY.items()}
NORM_INDEX.update(
    {
        "cjc1295": "prod_cjc1295_dac",
        "cjcipamorelin": "prod_cjc_ipa",
        "ipamorelincjc1295": "prod_cjc_ipa",
        "thymosinalpha1": "prod_thymosin_a1",
        "thymosina1": "prod_thymosin_a1",
        "ta1": "prod_thymosin_a1",
        "thymosinbeta4": "prod_thymosin_b4",
        "tb4": "prod_thymosin_b4",
        "ss31": "prod_ss31",
        "elamipretide": "prod_ss31",
        "mk677": "prod_mk677",
        "ibutamoren": "prod_mk677",
        "ghksu": "prod_ghkcu",
        "mtii": "prod_melanotan2",
        "mt2": "prod_melanotan2",
        "mt1": "prod_melanotan1",
        "hghsomatropin": "prod_hgh",
        "somatropin": "prod_hgh",
    }
)

COMPAT = {
    "complementary": "complementary",
    "compatible": "compatible",
    "incompatible": "incompatible",
    "neutral": "neutral",
}


def resolve(name):
    return NORM_INDEX.get(norm(name))


def jstr(s):
    """Emit a TS single-quoted string literal."""
    if s is None:
        s = ""
    s = " ".join(str(s).split())  # collapse whitespace/newlines
    s = s.replace("\\", "\\\\").replace("'", "\\'")
    return f"'{s}'"


def parse_weights(raw):
    keys = [
        "brain_mood",
        "health_wellness",
        "beauty_antiaging",
        "weight_metabolic",
        "performance_muscle",
        "recovery_longevity",
    ]
    try:
        d = json.loads(raw or "{}")
    except Exception:
        d = {}
    return {k: int(d.get(k, 0) or 0) for k in keys}


def main():
    with open(CSV) as f:
        rows = list(csv.DictReader(f))

    # Pick, per product id, the row with the most interaction entries.
    best = {}
    for r in rows:
        pid = NAME_TO_ID.get(r["name"])
        if not pid:
            continue
        try:
            n = len(json.loads(r["peptide_interactions"] or "[]"))
        except Exception:
            n = 0
        if pid not in best or n > best[pid][0]:
            best[pid] = (n, r)

    entries = []
    for pid, (_n, r) in best.items():
        weights = parse_weights(r["purpose_weights"])
        try:
            tags = json.loads(r["purpose_tags"] or "[]")
        except Exception:
            tags = []
        try:
            hl = float(r["half_life_hours"]) if r["half_life_hours"] else None
        except Exception:
            hl = None

        interactions = []
        seen = set()
        try:
            raw_int = json.loads(r["peptide_interactions"] or "[]")
        except Exception:
            raw_int = []
        for i in raw_int:
            compat = COMPAT.get((i.get("compatibility") or "").strip().lower())
            if not compat:
                continue
            with_name = (i.get("interaction") or "").strip()
            if not with_name or with_name in seen:
                continue
            seen.add(with_name)
            with_id = resolve(with_name)
            # Don't let a peptide interact with itself.
            if with_id == pid:
                continue
            interactions.append(
                {
                    "withName": with_name,
                    "withProductId": with_id,
                    "compatibility": compat,
                    "description": i.get("description") or "",
                }
            )

        entries.append(
            {
                "productId": pid,
                "name": ID_TO_DISPLAY[pid],
                "timingGuidance": r["protocol_timing"] or "",
                "halfLifeHours": hl,
                "purposeTags": tags,
                "purposeWeights": weights,
                "interactions": interactions,
            }
        )

    entries.sort(key=lambda e: e["productId"])

    lines = []
    lines.append("/**")
    lines.append(" * Reference peptide library — generated from the clinic's research CSV by")
    lines.append(" * scripts/gen_peptide_library.py. Layers timing, half-life, purpose")
    lines.append(" * affinities, and stack-interaction notes on top of the catalog products.")
    lines.append(" *")
    lines.append(" * Do not edit by hand; re-run the script to regenerate.")
    lines.append(" */")
    lines.append("import type { PeptideLibraryEntry } from '@beacon/domain';")
    lines.append("")
    lines.append("export const peptideLibrary: PeptideLibraryEntry[] = [")
    for e in entries:
        lines.append("  {")
        lines.append(f"    productId: '{e['productId']}',")
        lines.append(f"    name: {jstr(e['name'])},")
        lines.append(f"    timingGuidance: {jstr(e['timingGuidance'])},")
        hl = "null" if e["halfLifeHours"] is None else (
            str(int(e["halfLifeHours"])) if float(e["halfLifeHours"]).is_integer() else str(e["halfLifeHours"])
        )
        lines.append(f"    halfLifeHours: {hl},")
        tags = ", ".join(jstr(t) for t in e["purposeTags"])
        lines.append(f"    purposeTags: [{tags}],")
        w = e["purposeWeights"]
        lines.append(
            "    purposeWeights: { "
            + ", ".join(f"{k}: {v}" for k, v in w.items())
            + " },"
        )
        if not e["interactions"]:
            lines.append("    interactions: [],")
        else:
            lines.append("    interactions: [")
            for i in e["interactions"]:
                parts = [f"withName: {jstr(i['withName'])}"]
                if i["withProductId"]:
                    parts.append(f"withProductId: '{i['withProductId']}'")
                parts.append(f"compatibility: '{i['compatibility']}'")
                parts.append(f"description: {jstr(i['description'])}")
                lines.append("      { " + ", ".join(parts) + " },")
            lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    with open(OUT, "w") as f:
        f.write("\n".join(lines))

    resolved = sum(
        1 for e in entries for i in e["interactions"] if i["withProductId"]
    )
    total = sum(len(e["interactions"]) for e in entries)
    print(f"Wrote {len(entries)} entries to {OUT}")
    print(f"Interactions: {total} total, {resolved} resolved to catalog products")


if __name__ == "__main__":
    main()
