#!/bin/sh
# Rebuild all generated enhancements on index.html and en/index.html (idempotent).
set -e
cd "$(dirname "$0")/.."
python3 tools/enhance.py && python3 tools/enhance2.py && python3 tools/enhance3.py && python3 tools/enhance4.py && python3 tools/enhance5.py && python3 tools/enhance6.py && python3 tools/enhance7.py && python3 tools/enhance8.py && python3 tools/enhance9.py && python3 tools/enhance10.py && python3 tools/enhance11.py && python3 tools/enhance12.py && python3 tools/enhance13.py
