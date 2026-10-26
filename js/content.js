// SINGLE SOURCE OF TRUTH for business details and services.
// Everything marked review:true came from the public GlossGenius page
// (scraped 2026-10-25) and is NOT yet owner-approved. Do not publish until reviewed.
window.SALON = {
  name: "Looking Glass Salon",
  tagline: "Hair color, cuts and smoothing treatments",
  // One booking URL for every "Book" button. Always the site's own booking page; never point Book buttons at GlossGenius.
  bookingUrl: "book.html",
  // Her old GlossGenius site, linked from the footer "Old website" button for reference only.
  oldSiteUrl: "https://brandieryan.glossgenius.com/",
  existingSiteUrl: "https://brandieryan.glossgenius.com/portfolio",
  // null = unknown. Pages show a "to be confirmed" note instead of a fake value.
  location: { city: "Sterling, VA", address: null, parking: null, review: true },
  phone: null,
  email: null,
  hours: null,
  social: { instagram: null, facebook: null },
  // bio left empty on purpose: Brandie is writing it herself.
  owner: { name: "Brandie Ryan", nickname: "Mama Ryan", role: "Owner and stylist", bio: null },
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
    { name: "Tape Extension Installation", price: "$435+", duration: 90, desc: "$75.00 deposit required for new clients. First time installation of tape in hair extensions. Cost starts at $120 per 10 piece bundle, depending on length of hair, available in 14\u201d, 20\u201d and 24\u201d. Installation is $175. Additional charge for custom color work. Average head is between 2-3 bundles depending on the desired look." },
    { name: "Tape Extension Removal / Reinstall", price: "$250+", duration: 150, desc: "$175.00 deposit required. Hair tape in extensions is removed, washed, and reinstalled. Hair can last up to a year with 6-8 week maintenance and proper care." },
    { name: "Sew-In Micro Weft Installation", price: "$500+", duration: 180, desc: "Hair not included. Starting price; varies by number of rows." },
    { name: "Sew-In Micro Weft Removal", price: "$75", duration: 30, desc: "Removal only. Does not include putting wefts back in." },
    { name: "Sew-In Weft Move Up", price: "$200+", duration: 120, desc: "Sew-in removal and reinstall." },
    { name: "Extension Removal", price: "$75", duration: 45 },
    { name: "Replace Hair Extensions", price: "$250", duration: 150 }
  ]}
];

// Gallery: photos live in assets/gallery/. For each one set src, alt (what the photo shows,
// for screen readers), caption (optional) and tags. A null src shows a "Photo coming soon" tile.
// Optional pos sets which part of the photo shows in the square tile (default center). Tags become the filter chips. Photos below are from the owner's GlossGenius portfolio, used with her permission.
window.GALLERY = [
  { src: "assets/gallery/portfolio-01.jpg", alt: "Four before and after views of a blonde cut with soft, blended highlights", caption: "Blonde refresh with a mix of highlights and grey blending color.", tags: ["Blonde", "Highlights"] },
  { src: "assets/gallery/portfolio-02.jpg", alt: "Stylist lifting long brown hair with blonde highlights on a young woman looking down", caption: "", tags: ["Brunette", "Highlights"] },
  { src: "assets/gallery/portfolio-03.jpg", alt: "Back view of long brown hair with golden highlights", caption: "", tags: ["Brunette", "Highlights"] },
  { src: "assets/gallery/portfolio-04.jpg", alt: "Back view of long, smooth, glossy brown hair in the salon", caption: "", tags: ["Brunette"] },
  { src: "assets/gallery/portfolio-05.jpg", alt: "Long, straight, shiny brown hair with soft caramel tones", caption: "", tags: ["Brunette"] },
  { src: "assets/gallery/portfolio-06.jpg", alt: "Before photo: auburn hair from behind, marked Before", caption: "Before", pos: "left top", tags: ["Before & After"] },
  { src: "assets/gallery/portfolio-07.jpg", alt: "After photo: shoulder-length hair with soft blended blonde tones, marked After", caption: "After", pos: "left top", tags: ["Before & After", "Blonde"] },
  { src: "assets/gallery/portfolio-08.jpg", alt: "Woman looking down with shoulder-length hair in warm blonde and light brown tones", caption: "", tags: ["Blonde"] },
  { src: "assets/gallery/portfolio-09.jpg", alt: "Back view of long hair fading from brown roots to bright blonde ends", caption: "", tags: ["Blonde"] },
  { src: "assets/gallery/portfolio-10.jpg", alt: "Side view of light blonde layered hair held up by the stylist", caption: "", tags: ["Blonde"] },
  { src: "assets/gallery/portfolio-11.jpg", alt: "Young woman with smooth, long golden blonde hair parted at the side", caption: "", tags: ["Blonde"] },
  { src: "assets/gallery/portfolio-12.jpg", alt: "Back view of dark roots blending into golden blonde ends by a window", caption: "", tags: ["Blonde", "Highlights"] },
  { src: "assets/gallery/portfolio-13.jpg", alt: "Five before and after views of a vivid copper red color", caption: "Red head refresh!", tags: ["Red"] },
  { src: "assets/gallery/portfolio-14.jpg", alt: "Side view of layered hair with dark roots and golden blonde highlights", caption: "", tags: ["Blonde", "Highlights"] },
  { src: "assets/gallery/portfolio-15.jpg", alt: "Four views of layered hair with dark roots and soft blonde highlights", caption: "", tags: ["Blonde", "Highlights"] },
  { src: "assets/gallery/portfolio-16.jpg", alt: "Two side views of long layered hair with honey blonde highlights", caption: "", tags: ["Blonde", "Highlights"] },
  { src: "assets/gallery/portfolio-17.jpg", alt: "Close up of wavy hair with bright blonde highlights", caption: "", tags: ["Blonde", "Highlights"] }
];
