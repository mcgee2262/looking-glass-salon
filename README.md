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
