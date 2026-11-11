# IVAN — Next.js streetwear starter

A responsive Next.js App Router starter for IVAN, styled around Lagos streetwear culture.

## Run locally

1. Install Node.js 22 or later. This project uses ESM-only CSS tooling that requires Node.js 22.
2. In this folder run:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000.

## Replace the brand logo

Replace `public/images/ivan-logo.png` with your new transparent PNG/SVG (keep the filename). The original logo is used through `src/components/BrandLogo.tsx`. The wordmark is a separate text variant.

## Add the hero video

Put your video at `public/videos/hero.mp4`. The landing page already contains the video element and the explicit placeholder comment in `src/components/HeroVideo.tsx`. Use a compressed, muted MP4 for fast loading. The page still renders if the video is missing.

## Current pages

- `/` — full-screen video landing page, centred SHOP NOW CTA
- `/shop` — category filters, product cards, quick-view modal, local demo cart
- `/custom-studio` — custom concept form and style tags
- `/admin` — visual dashboard scaffold only

## Before going live

This is a frontend starter, not a complete production store. Add:
- Supabase Auth and database policies (RLS) for customers and the two approved partners.
- Supabase Storage for custom reference images and product photography.
- Server-side validation and persistence for custom requests and customer chat.
- A real payment provider integration and verified payment webhooks.
- Protected `/admin` server routes. Hiding a link is not security.
- Customer-isolated chat threads enforced by database policies.
- Real product photos, prices, stock, shipping, returns and privacy policy.
- Rate limits, input validation, file type/size checks, and secure secrets in environment variables.

The product art in the shop is CSS placeholder artwork, not real product photography. Replace it in `src/app/shop/page.tsx` with images from `public/images/products/`.

## Customer chat (Supabase)

1. Create a project at supabase.com. Auth -> Providers: turn on **Anonymous sign-ins**.
2. SQL Editor: run `supabase/chat.sql`.
3. In Auth -> Users, create each staff account with email and password. Add each account to `public.staff` using the SQL example at the bottom of `chat.sql` (replace `admin@example.com` with the account email).
4. Copy `.env.local.example` to `.env.local` and fill in your project URL and publishable key (legacy anon keys are also supported).
5. `npm install && npm run dev`. Customers chat via the green button; you reply at `/admin/inbox` (sign in at `/admin/login`).

Only authenticated users listed in `public.staff` can access `/admin` and its subroutes. Create staff users in Supabase Auth and add their user IDs to `public.staff`; having an account alone does not grant admin access. Test the staff side in a different browser or an incognito window: customer and staff sessions share one cookie in a single browser.

Files: `src/lib/chat.ts` (data layer), `src/components/chat/*` (widget + inbox), `src/middleware.ts` (staff-only /admin), `supabase/chat.sql` (tables + RLS).


## Store, payments and admin (v3)

**Customer side:** `/shop` (store), `/bag` (its own page), `/checkout` (delivery details + Paystack), `/checkout/success`, `/chat` (full-size chat; the navbar chat icon opens it).

**Admin (staff login required):** `/admin` dashboard, `/admin/orders`, `/admin/payments`, `/admin/inbox`. A bell shows live notifications for new orders, payments and chat messages.

**How a payment flows:** checkout form -> `POST /api/checkout` (server recomputes prices from `src/lib/products.ts`, starts a Paystack payment, saves the order as unpaid) -> customer pays on Paystack -> Paystack sends the customer back to `/checkout/success` and also calls `/api/paystack/webhook` -> the server asks Paystack to confirm, records the payment and marks the order paid -> database triggers create the staff notification.

**Setup:** put these in `.env.local` (see `.env.example`): `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY`. In Paystack set the webhook URL to `https://YOUR-SITE/api/paystack/webhook` (not reachable from localhost; locally the success page confirms the payment instead).

**Changing prices:** edit `src/lib/products.ts` (the server reads prices from there).


## v4: one colour system, light/dark, products, custom studio

- **Colours:** one palette everywhere (store, chat, admin) defined as tokens at the top of `src/app/globals.css`. Use `bg-bg`, `bg-surface`, `border-line`, `text-muted`, `bg-accent`, `text-accent-ink`, `text-hot`. Change a colour once and the whole site follows.
- **Dark / light mode:** the sun/moon button (navbar, admin top bar, login). The choice is remembered. The landing hero stays dark on purpose.
- **Store:** `/shop` (spotlight, tilt cards, search, sort, saved hearts), `/shop/[id]` (product page with size picker), `/bag`, `/checkout`.
- **Admin:** `/admin/products` (add/edit/hide products, upload photos, sizes, colours), `/admin/custom` (custom studio requests with reference files), `/admin/inbox` (use "End & clear chat" to delete a finished conversation).
- **Custom studio:** `/custom-studio` saves requests to Supabase (with an optional reference file) and notifies the admin.
