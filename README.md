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
All photos are Brandie's own work, copied from her GlossGenius portfolio with her permission (`assets/gallery/`). `portfolio-01` to `17` were cropped from screenshots. `ryan-01` to `19` are the owner's original phone photos from the "mama ryan" folder, resized to 1400px with location and camera data removed. There is no storybook artwork on the site.

## Look
Earthy palette: warm cream and pale wood, sage and moss greens, muted brass trim. No pink. Playfair Display headings, Pinyon Script for the signature. 3D touches: brass-lined cards and buttons, tilt on hover, a 3D brass hand mirror in the hero and a spinning mirror emblem above the footer.

## Adding gallery photos
1. Drop each approved photo in `assets/gallery/` (about 1200px on the long side, JPEG, under 300 KB).
2. In `js/content.js`, edit a `GALLERY` entry: set `src` (for example `assets/gallery/red-refresh.jpg`), `alt` (what the photo shows), an optional `caption`, and `tags`.
3. Tags become the filter chips on the Gallery page. Entries with `src: null` show a "Photo coming soon" tile.
Only publish photos the owner approved and the client agreed to share.

## Photos and videos (from the owner's "mama ryan" folder)
- Gallery photos: `assets/gallery/ryan-NN.jpg` (1400px) with `ryan-NN-t.jpg` thumbnails (640px). All EXIF and GPS data was removed. The owner confirmed clients agreed to have their faces shown.
- Before/after sliders: `assets/ba/ba-01`, `ba-02` (halves of the owner's collages). Extensions story: `assets/ba/ext-1` to `ext-3`. To add a slider, copy a `<figure class="ba">` block from `gallery.html`.
- Studio tour: `assets/studio/`. Brandie's photo: `assets/brandie.jpg`.
- Video loops: `assets/video/*.mp4` with `.jpg` posters. Six seconds, silent, about 1.8 MB each. They load and play only when scrolled near. Make more with the same settings (640x480 preset, audio removed).
- Originals stay in the owner's folder; they are not in this repo.

## Higgsfield images (Phase 2)
- `assets/hero/`: three of Brandie's own photos upscaled to 2K with Higgsfield (`hero-blonde`, `hero-copper`, `hero-bob`). The hair is unchanged, only sharper.
- `assets/art/`: AI-generated still lifes of salon tools (flat lay, mirrors, swatch fan, tray, plaster wall, ribbons) made with Higgsfield `gpt_image_2_5` at 2K, high quality. Palette: sage, pale oak, brass, cream. These are brand art, **not photos of the salon**; the footer says so. Never use AI images to show hair results.
- `ribbons.jpg` and `plaster.jpg` are spare backgrounds for later.

## Phase 3: 3D hair
- **Hair locks in the hero** (`js/hero3d.js`, section "hair"): six locks of nine silky strands each, drawn in code in Brandie's real tones (honey, copper, ash blonde, espresso, caramel). They sweep in from the corners behind the mirror, part around the pointer, and shrink away during the portal dive. Phones get fewer, thinner strands. Edit `LOCKS` to change colors and lanes.
- **Swatch ring** (`js/swatchring.js`, Gallery page "Find your shade"): a spinning 3D ring of 11 shades. Drag or tap to spin, it snaps to a shade, and "Show these photos" filters the gallery by that shade's tag (`SHADES` at the top of the file maps each shade to a gallery tag). The shade buttons under the ring are the keyboard and no-WebGL route.

## Round 4 changes
- **Hero:** no mirror and no scroll-through. The page is one big shimmering "LOOKING GLASS" wordmark over the 3D hair locks; scrolling just moves to the next section (`js/hero3d.js`, hair only).
- **Hover:** the gold glare on cards, photos and tiles is gone. The tilt motion stays.
- **Booking images:** `assets/book/` has one AI-made still life per service category (consultation, color, highlights, add-ons, smoothing, extensions), used on the booking page. They show tools, not hair results.
- **3D tour:** `js/tour3d.js` on the Visit page. A simple 3D model of the studio, six stops, each showing a real photo. The 3D room is an illustration; the layout is simplified. Edit `STOPS` to change stops or captions.

## Round 5 changes
- **Fonts:** Cormorant Garamond (headings, wordmark, signature) and Jost (everything else). Loaded from Google Fonts in each page head.
- **Logo:** `assets/logo.svg` (brass hand mirror with an LG monogram). Also the favicon (`assets/favicon.svg`) and the header mark.
- **Services:** 18 on the site (`SERVICES` in `js/content.js`). The "+ Cut/Style" prices are folded into each card's text. Add-ons live in `ADDONS` and only show in the booking Extras step. Everything removed is kept in `MORE_SERVICES`.
- **Hair:** the cursor push is continuous and each lock follows the pointer with its own soft lag.
- **3D tour (`js/tour3d.js`):** real window openings with the sun casting window-frame shadows across an oak floor, ACES tone mapping, environment reflections, procedural oak/plaster/rug textures, detailed chairs, mirrors, shampoo bowls, lounge and desk, fake contact shadows, soft sunbeams, and a slow film-style camera. For a photo-real version, scan the studio (Polycam or Luma) or shoot 360 photos and replace the model.

## Service pictures
Each of the 18 services (and the 7 add-ons) has its own picture in `assets/book/svc/`, mapped by service name in `SVC_IMG` at the top of `js/book.js`. Almost all are crops of Brandie's own client photos. Two are AI still lifes of tools, because there is no client photo that shows them: `mens-cut.jpg` (clippers and comb) and `sew-in.jpg` (a hair weft and beads). To change one, replace the file or edit `SVC_IMG`.
