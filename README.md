# Looking Glass Salon

## 👉 View the live site: https://mcgee2262.github.io/looking-glass-salon/

This is a **draft for the owner to review**. Service names, prices and times were copied from the public GlossGenius page and are not yet approved. Anything marked "To be confirmed" is waiting on the owner. Booking happens on GlossGenius.

Pages: [Home](https://mcgee2262.github.io/looking-glass-salon/) · [Services](https://mcgee2262.github.io/looking-glass-salon/services.html) · [Gallery](https://mcgee2262.github.io/looking-glass-salon/gallery.html) · [About](https://mcgee2262.github.io/looking-glass-salon/about.html) · [Visit](https://mcgee2262.github.io/looking-glass-salon/visit.html)

Changes can take about a minute to appear after they are pushed.

---


Plain static HTML/CSS/JS. No build step. Booking stays on GlossGenius.

- Edit business details, services, gallery: `js/content.js` (only place).
- Booking: every Book button goes to the site's own booking page (`book.html`, `SALON.bookingUrl`). Never point Book buttons at GlossGenius. The footer has an "Old website" button linking her GlossGenius site (`SALON.oldSiteUrl`) for reference only.
- Run locally: `python3 -m http.server 8431`
- Every service/price/duration came from the public GlossGenius page on 2026-10-25. Unapproved. Null fields show "To be confirmed".
- Pages carry `noindex`. Remove it, add canonical, og:image and LocalBusiness JSON-LD after owner approval and domain pick.
- No GlossGenius API/export/CRM work here. That is Phase 3 discovery.

## Still needed from owner
Logo/brand, approved photos + alt text, bio, hours, address, phone/email, policies, social links, domain/hosting, analytics decision.

## Pictures
All photos are Brandie's own work, copied from her GlossGenius portfolio with her permission (`assets/gallery/`). They were cropped from screenshots, so swap in the original files when available. There is no storybook artwork on the site.

## Look
Earthy palette: warm cream and pale wood, sage and moss greens, muted brass trim. No pink. Playfair Display headings, Pinyon Script for the signature. 3D touches: brass-lined cards and buttons, tilt on hover, a 3D brass hand mirror in the hero and a spinning mirror emblem above the footer.

## Adding gallery photos
1. Drop each approved photo in `assets/gallery/` (about 1200px on the long side, JPEG, under 300 KB).
2. In `js/content.js`, edit a `GALLERY` entry: set `src` (for example `assets/gallery/red-refresh.jpg`), `alt` (what the photo shows), an optional `caption`, and `tags`.
3. Tags become the filter chips on the Gallery page. Entries with `src: null` show a "Photo coming soon" tile.
Only publish photos the owner approved and the client agreed to share.
