# PortfolioRoaster — Coming Soon Landing Page PRD

## Original problem statement
> This is my android app which i have published for closed testing in the playstore now i want you to make a landing page for the app which is basically a coming soon landing page where users can join the waitlist using only their email address no need to add anything fancy, just try to make this whole landing page as 3D as possible with animations, scroll animations and many more to make the landing page much more interactive for users.
>
> Notes: Add "currently available for android only" and "currently 100% free for all".

## App
**PortfolioRoaster** — Android app (closed testing on Play Store). AI roasts developer portfolios like a brutal senior FAANG engineer: score + 5 callouts + 5 fixes + shareable card.

## User personas
- CS / IT students and junior devs desperately trying to land interviews.
- Freelance devs updating personal sites / GitHub.
- Tech Twitter / r/developersIndia crowd who love shareable meme-worthy content.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB), endpoints:
  - `POST /api/waitlist` — { email, source? } → `{ok, already_joined, position, total}`
  - `GET /api/waitlist/count` → `{total}`
  - `GET /api/` / `GET /api/health`
  - Unique index on `waitlist.email` (created at startup)
- **Frontend**: React 19 + CRA (craco) + Tailwind + shadcn/ui + react-three-fiber v9 + drei + framer-motion
  - Landing page sections: Marquee → Hero (3D phone scene) → Verdict (dark, 3D knot) → Features grid (tilt cards) → How-it-works → Sample Roast card (scroll rotate+scale) → FAQ (accordion) → Final CTA (3D knot) → Footer
  - Fonts: Bebas Neue (display) + Instrument Serif (italic accents) + DM Mono (body)
  - Palette: paper `#f5f0e8`, ink `#0a0a0a`, accent `#ff4500`, gold `#c8a951`
  - R3F compat shim at `src/lib/r3f-compat.js` patches React.createElement + jsx-runtime to strip visual-edits `x-*` debug attrs from R3F intrinsic elements (mesh/group/planeGeometry/etc.). Must be imported FIRST in `src/index.js`.

## What's implemented (Dec 2025)
- [x] MongoDB-backed email waitlist with dedup, position, and total count
- [x] Editorial/brutalist landing page matching the antigravity HTML reference style
- [x] 3D hero scene: floating phone with UI overlay + orbiting blobs + tori
- [x] Ambient 3D torus-knots in Verdict and Final CTA sections
- [x] Framer-motion scroll parallax on hero title, feature cards, sample-roast rotate+scale
- [x] "Android only" + "100% free" + "Closed testing" badges
- [x] Hero + Footer waitlist forms (data-testids on every interactive element)
- [x] FAQ accordion (shadcn), marquee ticker, stamp/brutalist dividers
- [x] Sonner toasts (dark/accent styled)
- [x] End-to-end testing — 9/9 backend + all frontend flows passing on desktop + mobile

## Test credentials
No auth — waitlist only.

## Backlog (P1)
- Email confirmation to waitlist joiners via Resend (requires RESEND_API_KEY)
- Admin route to export waitlist CSV (with simple token gate)
- Analytics: count clicks on "Android only" badge and Play Store deeplink
- iOS coming-soon toggle when iOS app lands
- Invite a-friend referral to jump the queue (viral loop)

## Backlog (P2)
- Dark-mode toggle (some users may prefer it)
- Localization: EN / HI
- Per-source conversion dashboard (hero vs footer CTA)
