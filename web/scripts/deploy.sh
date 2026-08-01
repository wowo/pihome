#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
# Angular application builder outputs to dist/web/browser/
rsync -avz --delete dist/web/browser/ pi:/var/www/pihome/
echo "Deployed to pi:/var/www/pihome/"
