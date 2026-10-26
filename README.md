# Looking Glass Salon site (draft)

Plain static HTML/CSS/JS. No build step. Booking stays on GlossGenius.

- Edit business details, services, gallery: `js/content.js` (only place).
- Booking URL: `SALON.bookingUrl` in `js/content.js`.
- Run locally: `python3 -m http.server 8431`
- Every service/price/duration came from the public GlossGenius page on 2026-10-25. Unapproved. Null fields show "To be confirmed".
- Pages carry `noindex`. Remove it, add canonical, og:image and LocalBusiness JSON-LD after owner approval and domain pick.
- No GlossGenius API/export/CRM work here. That is Phase 3 discovery.

## Still needed from owner
Logo/brand, approved photos + alt text, bio, hours, address, phone/email, policies, social links, domain/hosting, analytics decision.

## Pictures and credits
Illustrations are public-domain plates from *Through the Looking-Glass* (John Tenniel, 1871, and a 1907 edition) from Wikimedia Commons. They are decoration, not the salon's work. Sources and licences: `assets/credits.json` (shown in every page footer, built in `js/site.js`). Replace them with the owner's own approved photos when available.

## Design pass
Run with the taste-skill (`design-taste-frontend`). Flat tone steps instead of gradients and outlines, 18px body, one big title per page, entrance motion. The 3D hero keeps its gradients, gradient chrome wordmark and portal on purpose; the inspector flags those.
