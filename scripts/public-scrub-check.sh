#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${repo_root}" ]]; then
  echo "ERROR: not in a git repository"
  exit 2
fi

cd "${repo_root}"

fail=0

echo "[1/4] Checking for accidentally tracked secret files..."
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "ERROR: .env is tracked. Remove it from git history before publishing."
  fail=1
fi

tracked_env_dotfiles="$(git ls-files '.env.*' | rg -v '^\.env\.example$' || true)"
if [[ -n "${tracked_env_dotfiles}" ]]; then
  echo "ERROR: tracked dotenv files found (allowed: .env.example only):"
  echo "${tracked_env_dotfiles}"
  fail=1
fi

echo "[2/4] Checking for tracked databases/logs..."
tracked_data_files="$(git ls-files | rg -n '\.(db|sqlite|sqlite3|log)$' || true)"
if [[ -n "${tracked_data_files}" ]]; then
  echo "ERROR: tracked DB/log artifacts found:"
  echo "${tracked_data_files}"
  fail=1
fi

echo "[3/4] Scanning tracked files for common secret patterns..."
pattern_high_signal='(?i)(ghp_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{35}|sk_(live|test)_[0-9A-Za-z]{20,}|BEGIN OPENSSH PRIVATE KEY|BEGIN RSA PRIVATE KEY|BEGIN EC PRIVATE KEY|BEGIN PRIVATE KEY|-----BEGIN)'
pattern_assignment='(?im)^(?:[A-Z0-9_]*?(?:SECRET|PASSWORD|PASSWD|TOKEN|API_KEY|ACCESS_KEY|PRIVATE_KEY)[A-Z0-9_]*?)\s*=\s*[^\s#]{8,}\s*$|(?i)(?:secret|password|token|api[_-]?key)\s*[:=]\s*\"[^\"]{8,}\"|(?i)authorization\s*:\s*bearer\s+[A-Za-z0-9\-._~+/]+=*'

matches_file="$(mktemp)"
err_file="$(mktemp)"
set +e
git ls-files -z | xargs -0 rg -n -S -P --no-heading --color=never "${pattern_high_signal}" >"${matches_file}" 2>"${err_file}"
set -e
if [[ -s "${err_file}" ]]; then
  echo "ERROR: secret scan failed:"
  cat "${err_file}"
  fail=1
fi
if [[ -s "${matches_file}" ]]; then
  echo "ERROR: possible secrets found in tracked files:"
  cat "${matches_file}"
  fail=1
fi
rm -f "${matches_file}" "${err_file}"

matches_file="$(mktemp)"
err_file="$(mktemp)"
set +e
git ls-files -z | xargs -0 rg -n -S -P --no-heading --color=never "${pattern_assignment}" 2>"${err_file}" \
  | rg -v -n -S -P '(?i)(change-me|placeholder|example|BUILD_TIME_PLACEHOLDER|INSERT_YOUR_|YOUR_.*HERE)' \
  >"${matches_file}"
set -e
if [[ -s "${err_file}" ]]; then
  echo "ERROR: secret scan failed:"
  cat "${err_file}"
  fail=1
fi
if [[ -s "${matches_file}" ]]; then
  echo "ERROR: suspicious secret-like assignments found in tracked files:"
  cat "${matches_file}"
  fail=1
fi
rm -f "${matches_file}" "${err_file}"

echo "[4/4] Checking commit metadata (optional)..."
non_noreply_count="$(
  git log --format='%ae' | sort -u | rg -v '@users\.noreply\.github\.com$' | wc -l | tr -d ' '
)"
if [[ "${non_noreply_count}" -gt 0 ]]; then
  echo "WARN: ${non_noreply_count} unique commit author email(s) are not GitHub noreply."
  echo "      If you care about email privacy, rewrite history before pushing."
fi

if [[ ${fail} -ne 0 ]]; then
  exit 1
fi

echo "OK: no obvious secrets detected in tracked files."
