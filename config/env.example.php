<?php
/**
 * Copy to config/env.php (gitignored) and fill in real values.
 * Keep keys in sync with env.php. Never commit real secrets.
 *
 * Env::get order: $_SERVER (Apache SetEnv) > getenv() > this file > default.
 * Missing env.php is ignored silently. Ensure the PHP user can read env.php
 * (e.g. chmod 640, owner you:www-data).
 *
 * TRUST_CF_CONNECTING_IP: only honoured when REMOTE_ADDR is in CF_IP_RANGES.
 * Leave false if unsure.
 *
 * STRICT_ERRORS: when true, warnings become exceptions. When omitted: true if
 * APP_ENV is dev/development/local, false otherwise. Local pilot sets 0 while
 * legacy includes may still run.
 *
 * BASE_URL: preferred. Env::get('BASE_URL') falls back to GPS_BASE_URL when
 * BASE_URL is unset (temporary alias until Phase 6 confirms prod BASE_URL).
 */
return [
    'APP_ENV' => 'dev', // dev | prod
    'BASE_URL' => 'http://gpstoolset.lan',
    // Optional legacy alias (only used when BASE_URL is unset):
    // 'GPS_BASE_URL' => 'https://gpstoolset.com',
    'STRICT_ERRORS' => 0,
    'TRUST_CF_CONNECTING_IP' => false,
];
