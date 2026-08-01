# PiHome Rewrite Design

Approved 2026-08-01. Soft daylight Angular PWA + Supabase storage/auth. Sensors UI deferred.

## Goals

- Replace Angular 1 Yeoman app with latest Angular PWA (Tailwind, PL/EN, iPhone SE-first).
- Three tabs: Main, Schedule, History. Sensors charting out of MVP (historical data migrated for later).
- Move MongoDB history/readings to Supabase; retire Cloudflare Access; keep Cloudflare proxy for TLS.
- Switch control works on LAN with no internet.

## Visual design

- Soft daylight: `#f7f4ef` background, sage brand, muted blue/red/green buttons with light gradients and soft emboss.
- Bottom tab bar: Main / Schedule / History.
- Main: 3-column grid; blinds keep up/down; timed on/off is one button with ▾; tap toggles, long-press/▾ opens duration bottom sheet.
- Mockup: `.superpowers/brainstorm/2634-1785594351/content/main-iphone-se-v2.html`.

## Architecture

```
PWA --PATCH/poll--> Pi Flask API (LAN or domain)
PWA --Auth/Realtime/history--> Supabase
Pi  --upsert state + insert events--> Supabase (Redis queue when offline)
```

- Switch state: Pi upserts `switch_state`; PWA uses Supabase Realtime; falls back to 20s Pi polling when Realtime is down.
- Commands: always direct PATCH to Pi on current origin. No command relay.
- Auth: Google-only Supabase Auth, invite-only. Domain origin requires login. LAN IP (`http://192.168.254.9`) boots offline mode with no auth.
- Pi verifies Supabase JWT (JWKS, disk-cached) on mutating routes except LAN/localhost.

## Supabase schema

- `switch_events(id, date, switch, state, user_email)`
- `switch_state(key PK, state, scheduled jsonb, updated_at)` — Realtime
- `readings(id, date, sensor_key, value, kind)` — migrated history only in MVP

## Repos

- Frontend: `pihome` (new Angular app; old `app/` until cutover)
- Backend: `pihome-api` (store.py → Supabase; JWT auth; retire Mongo reads)

## Out of scope (MVP)

Sensors UI, Chart.js, command relay, VPN, mTLS, dark mode.
