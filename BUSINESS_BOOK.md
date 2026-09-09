# Artist Bungalow Business Book

Private accompanying URL for Spatial Escapes / Artist Bungalow operations. Public marketing pages stay open.

## URL

- Book: `/business`
- PDF: `/business/book.pdf`
- Document vault: `/business-book/` (and the vault section on `/business`)

These paths are gated. `/`, the guidebook, and other public pages are not.

## Password (Vercel)

Do **not** hardcode a password. Set environment variables on the Vercel project, then redeploy.

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Add `BUSINESS_BOOK_PASSWORD` (sensitive) for Production, Preview, and Development
3. Optional: `BUSINESS_BOOK_USERNAME` (defaults to any username if unset; set this if you want a fixed Basic Auth username, e.g. `spatial`)
4. Redeploy so middleware can read the values

CLI equivalent:

```bash
printf '%s' 'your-password' | vercel env add BUSINESS_BOOK_PASSWORD production preview development --sensitive
printf '%s' 'spatial' | vercel env add BUSINESS_BOOK_USERNAME production preview development
```

Locally, copy `.env.example` to `.env.local` and run `vercel dev`. Opening HTML files with a static server does **not** apply the gate; middleware only runs on Vercel.

If `BUSINESS_BOOK_PASSWORD` is missing, gated routes return 503 instead of serving the book.

## Document vault

See `business-book/README.md`. Add the three packet PDFs there in a follow-up. Do not commit empty binaries.

## Scope

No lockbox, door codes, Wi-Fi passwords, or guest PII in this feature.
