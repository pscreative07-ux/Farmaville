#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VALIDATOR="$ROOT_DIR/skills/skill-creator/scripts/quick_validate.py"

for skill in skill-creator game-dev video-generator; do
  echo "Validando $skill"
  python3 "$VALIDATOR" "$ROOT_DIR/skills/$skill"
done

echo "Todas as habilidades foram validadas."
