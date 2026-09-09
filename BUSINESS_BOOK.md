# Artist Bungalow Business Book

Private accompanying URL for Spatial Escapes / Artist Bungalow operations. Public marketing pages stay open.

## URL

- Book: `/business`
- Sign in: `/business/login`
- Create a passkey: `/business/enroll`
- PDF: `/business/book.pdf`
- Document vault: `/business-book/` (and the vault section on `/business`)

These paths are gated. `/`, the guidebook, and other public pages are not.

## How you sign in

**Primary:** WebAuthn passkey (Touch ID / Face ID / device passkey on your Mac). After a successful assertion the site sets a session cookie.

**Fallback:** backup password, only if a passkey is unavailable or not registered yet. Do not use a memorized password as the daily path.

## Vercel environment variables

Set these on the project (**Settings → Environment Variables**) for Production, Preview, and Development, then redeploy.

| Variable | Required | Purpose |
| --- | --- | --- |
| `BUSINESS_BOOK_SESSION_SECRET` | Recommended | Signs session cookies. If unset, the setup token or backup password is used as the signing key. |
| `BUSINESS_BOOK_SETUP_TOKEN` | Recommended | Unlocks first-time passkey enrollment at `/business/enroll`. |
| `BUSINESS_BOOK_PASSWORD` | Optional fallback | Backup sign-in, and can also unlock enrollment if no setup token was used. |
| `BUSINESS_BOOK_WEBAUTHN_CREDENTIALS` | Optional | JSON array of passkey public keys so another browser can verify a passkey without enrolling again. |
| `BUSINESS_BOOK_RP_ID` | Optional | WebAuthn RP ID. Defaults to the request hostname (`theartistbungalow.com` in production). |
| `BUSINESS_BOOK_ORIGIN` | Optional | Expected origin. Defaults to the request origin. |

CLI example:

```bash
printf '%s' "$(openssl rand -hex 32)" | vercel env add BUSINESS_BOOK_SESSION_SECRET production preview development --sensitive
printf '%s' 'your-setup-token' | vercel env add BUSINESS_BOOK_SETUP_TOKEN production preview development --sensitive
printf '%s' 'optional-backup-password' | vercel env add BUSINESS_BOOK_PASSWORD production preview development --sensitive
```

Passkeys are bound to the hostname. A passkey created on `theartistbungalow.com` will not work on a `*.vercel.app` preview. Enroll separately on preview if you need it there, or set `BUSINESS_BOOK_RP_ID` / `BUSINESS_BOOK_ORIGIN` only when you know you need an override.

## Enroll a passkey on a Mac (Chrome or Safari)

1. Set `BUSINESS_BOOK_SETUP_TOKEN` (and ideally `BUSINESS_BOOK_SESSION_SECRET`) on Vercel and redeploy.
2. On the Mac, use **Safari** or **Chrome** and open `https://theartistbungalow.com/business/enroll` (HTTPS is required except localhost).
3. Enter the setup token. You can leave the backup password blank if you are using the token.
4. Click **Create passkey**. Approve the system prompt (Touch ID, Face ID, or device password).
5. You should land on the business book. Next visits: open `/business`, choose **Sign in with passkey**, approve Touch ID.

Chrome uses the platform passkey provider (iCloud Keychain and/or Google Password Manager). Safari uses iCloud Keychain. If no prompt appears, check **System Settings → Passwords** (and Chrome’s passkey settings) and that this Mac has iCloud Keychain or another passkey provider enabled.

If you switch browsers and sign-in says the passkey is not registered yet, either enroll again with the setup token on that browser, or paste the optional public-key JSON from the enroll success panel into `BUSINESS_BOOK_WEBAUTHN_CREDENTIALS`.

Locally, copy `.env.example` to `.env.local` and run `vercel dev`. A plain static server does not apply the gate.

## Document vault

See `business-book/README.md`. Add the packet PDFs there in a follow-up. Do not commit empty binaries.

## Scope

No lockbox, door codes, Wi-Fi passwords, or guest PII in this feature.
