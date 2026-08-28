#!/usr/bin/env python3
"""Run the reusable Farmaville pharmacy catalog normalizer."""
from pathlib import Path
import subprocess
import sys

ROOT = Path('/home/ubuntu/farmaville')
SKILL_SCRIPT = Path('/home/ubuntu/skills/farmaville-pharmacy-ecommerce/scripts/normalize_catalog.py')
SOURCE = Path('/home/ubuntu/upload/farmaville-catalogo-produtos.xlsx')
JSON_OUT = ROOT / 'catalog-normalized.json'
TS_OUT = ROOT / 'client/src/data/catalog.ts'

command = [sys.executable, str(SKILL_SCRIPT), str(SOURCE), '--json', str(JSON_OUT), '--typescript', str(TS_OUT)]
subprocess.run(command, check=True)
