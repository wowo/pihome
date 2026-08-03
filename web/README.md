# PiHome web (Angular PWA)

Soft-daylight Angular PWA. Legacy AngularJS UI lives under `/app` (unused in production).

## Dev

```bash
npm install
npm start          # http://localhost:4200, proxies /api -> 192.168.254.9
node scripts/check-duration.mjs
```

## Build / deploy

```bash
npm run build
./scripts/deploy.sh   # rsync dist/web/ -> pi:/var/www/pihome/
```

## Env

`src/environments/environment*.ts` point at Supabase project `agxpttxixydvttjnxhbn`.

## Auth (manual dashboard steps)

1. Supabase → Authentication → Providers → enable **Google**, disable email signup.
2. Add Google OAuth client credentials; set redirect URL to `https://agxpttxixydvttjnxhbn.supabase.co/auth/v1/callback`.
3. Invite / create the three family users (or first Google login with “allow new users” briefly enabled, then disable).
4. Cloudflare Access: remove the Access application for `pihome.sznapka.pl` (keep the orange-cloud proxy).
5. On the Pi, set `storing.supabase` in `config.yml` (url + service_role_key from Supabase settings).

## Origins

- `https://pihome.sznapka.pl` — Google login required for Supabase features; Pi JWT on mutations.
- `http://192.168.254.9` — LAN offline mode, no login, Pi polling.
