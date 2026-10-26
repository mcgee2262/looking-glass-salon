// SINGLE SOURCE OF TRUTH for business details and services.
// Everything marked review:true came from the public GlossGenius page
// (scraped 2026-10-25) and is NOT yet owner-approved. Do not publish until reviewed.
window.SALON = {
  name: "Looking Glass Salon",
  tagline: "Hair color, cuts and smoothing treatments",
  // One booking URL for every "Book" button. Booking happens on GlossGenius.
  bookingUrl: "https://brandieryan.glossgenius.com/book",
  existingSiteUrl: "https://brandieryan.glossgenius.com/portfolio",
  // null = unknown. Pages show a "to be confirmed" note instead of a fake value.
  location: { city: "Sterling, VA", address: null, parking: null, review: true },
  phone: null,
  email: null,
  hours: null,
  social: { instagram: null, facebook: null },
  owner: { name: null, bio: null },
  policies: { cancellation: null },
  domain: null
};

// price: display string ("$100+" = starts at). null = hide.
// duration: minutes, null = hide. depositNote: text from the public page.
window.SERVICES = [
  { cat: "Consultation & Cuts", items: [
    { name: "Consultation", price: "$0", duration: 15, desc: "For new guests who want to discuss service options to best suit their hair needs." },
    { name: "Women's Haircut & Blow Dry/Style", price: "$100+", duration: 60 },
    { name: "Men's Haircut", price: "$70+", duration: 45 },
    { name: "Children's Cut (10 & under)", price: "$60+", duration: 45 },
    { name: "Shampoo & Blow Dry/Style", price: "$70+", duration: 45, desc: "A pampering shampoo and blow dry/style service." },
    { name: "Bang Trim", price: "$20", duration: 15, desc: "A precise bang trim to keep your style on point." }
  ]},
  { cat: "Color", items: [
    { name: "Color Retouch & Style", price: "$230+", duration: 135, desc: "Color gloss included in the price unless specified." },
    { name: "Color Retouch + Cut/Style", price: "$260+", duration: 150, desc: "Gloss included unless specified." },
    { name: "All-Over Color & Style", price: "$240+", duration: 150 },
    { name: "All-Over Color + Cut/Style", price: "$300+", duration: 180 },
    { name: "Gloss/Toner", price: "$70+", duration: 45 },
    { name: "Perm + Cut/Style", price: "$230+", duration: 145 }
  ]},
  { cat: "Highlights & Balayage", items: [
    { name: "Partial Highlight + Style", price: "$250", duration: 165, desc: "Gloss included unless specified." },
    { name: "Partial Highlight + Cut/Style", price: "$300+", duration: 165, desc: "Gloss included unless specified." },
    { name: "Full Highlight & Style", price: "$280+", duration: 165, desc: "Gloss included unless specified." },
    { name: "Full Highlight + Cut/Style", price: "$340", duration: 210, desc: "Gloss included unless specified." },
    { name: "Face Frame Highlight & Style", price: "$190+", duration: 135, desc: "Gloss included unless specified." },
    { name: "Face Frame Highlight + Cut/Style", price: "$260", duration: 150, desc: "Gloss included unless specified." },
    { name: "Balayage + Style", price: "$370+", duration: 195, desc: "Gloss included unless specified." },
    { name: "Balayage + Cut/Style", price: "$400", duration: 210, desc: "Gloss included unless specified." }
  ]},
  { cat: "Add-Ons", items: [
    { name: "Add On Full Highlights", price: "$220+", duration: 60, desc: "Add full highlights to your color service." },
    { name: "Add On Face Frame Highlights", price: "$90+", duration: 30, desc: "A little brightness around your face." },
    { name: "Add On Partial Highlights", price: "$150+", duration: 45, desc: "Add a partial highlight onto a color retouch service." },
    { name: "Add On Color Retouch", price: "$100+", duration: 45, desc: "A root touch-up added to another color service." },
    { name: "Extra Product Charge", price: "$30", duration: 10 },
    { name: "Conditioning Treatment", price: "$20", duration: 10 },
    { name: "Malibu Treatment", price: "$20", duration: 10 }
  ]},
  { cat: "Smoothing Treatments", items: [
    { name: "Cezanne Keratin Express Treatment", price: "$220+", duration: 120, desc: "Formaldehyde-free keratin smoothing. Quicker service, results last about 3 months." },
    { name: "Cezanne Keratin Smoothing Treatment", price: "$400+", duration: 180, desc: "Formaldehyde-free keratin smoothing. Longer-lasting, results last about 5 months." },
    { name: "Express Blonde Keratin Treatment", price: "$200+", duration: 120, desc: "Quick keratin treatment made for blondes, smooths and tones without added warmth." },
    { name: "Cezanne Ultimate Blonde Treatment", price: "$400+", duration: 180, desc: "Lasts about 5 months. Blue-violet pigment to remove brassy shades while smoothing damaged hair." }
  ]},
  { cat: "Extensions", items: [
    { name: "Tape Extension Installation", price: "$435+", duration: 90, desc: "First-time tape-in install. $75 deposit required for new clients. Bundles start at $120 per 10 pieces; install is $175. Custom color work costs extra." },
    { name: "Tape Extension Removal / Reinstall", price: "$250+", duration: 150, desc: "Tape-ins are removed, washed and reinstalled. $175 deposit required." },
    { name: "Sew-In Micro Weft Installation", price: "$500+", duration: 180, desc: "Hair not included. Starting price; varies by number of rows." },
    { name: "Sew-In Micro Weft Removal", price: "$75", duration: 30, desc: "Removal only. Does not include putting wefts back in." },
    { name: "Sew-In Weft Move Up", price: "$200+", duration: 120, desc: "Sew-in removal and reinstall." },
    { name: "Extension Removal", price: "$75", duration: 45 },
    { name: "Replace Hair Extensions", price: "$250", duration: 150 }
  ]}
];

// Gallery: real photos go in assets/gallery/. For each one set src, alt (what the photo shows,
// for screen readers), caption (optional) and tags. A null src shows a "Photo coming soon" tile.
// Only add photos the owner approved and the client agreed to share. Tags become the filter chips.
// Captions below are the public ones from the existing GlossGenius portfolio; no photos copied.
window.GALLERY = [
  { src: null, alt: "", caption: "Red head refresh!", tags: ["Color", "Red"] },
  { src: null, alt: "", caption: "Beautiful sun kissed highlights with dimensional root shadowing.", tags: ["Highlights"] },
  { src: null, alt: "", caption: "Honey gloss over faded highlights to richen the color and give shine and improved health to the hair.", tags: ["Color", "Blonde"] },
  { src: null, alt: "", caption: "Blonde refresh with a mix of highlights and grey blending color.", tags: ["Highlights", "Blonde"] },
  { src: null, alt: "", caption: "", tags: ["Cuts"] },
  { src: null, alt: "", caption: "", tags: ["Extensions"] },
  { src: null, alt: "", caption: "", tags: ["Smoothing"] },
  { src: null, alt: "", caption: "", tags: ["Balayage"] }
];
