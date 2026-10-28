/**
 * Builds the "Looking Glass Salon: website info" Google Form for Brandie (Mama Ryan).
 * Asks for everything the site still shows as "To be confirmed", plus a price check
 * of every service copied from GlossGenius on 2026-10-25.
 *
 * How to run: script.google.com > New project > paste this file > Run buildSalonForm.
 * Allow the permissions it asks for. The form and an answers spreadsheet appear in
 * your Google Drive, and the links print in the Execution log.
 *
 * Service rows mirror js/content.js. If prices there change, update SERVICE_GROUPS.
 */

var SERVICE_GROUPS = [
  { cat: "Consultation & Cuts", rows: [
    "Consultation — $0, 15 min",
    "Women's Haircut & Blow Dry/Style — $100+, 60 min",
    "Men's Haircut — $70+, 45 min",
    "Children's Cut (10 & under) — $60+, 45 min",
    "Shampoo & Blow Dry/Style — $70+, 45 min"
  ]},
  { cat: "Color", rows: [
    "Color Retouch & Style — $230+, 135 min",
    "With a cut: Color Retouch + Cut/Style — $260+, 150 min",
    "All-Over Color & Style — $240+, 150 min",
    "With a cut: All-Over Color + Cut/Style — $300+, 180 min",
    "Gloss/Toner — $70+, 45 min"
  ]},
  { cat: "Highlights & Balayage", rows: [
    "Partial Highlight + Style — $250, 165 min",
    "With a cut: Partial Highlight + Cut/Style — $300+, 165 min",
    "Full Highlight & Style — $280+, 165 min",
    "With a cut: Full Highlight + Cut/Style — $340, 210 min",
    "Face Frame Highlight & Style — $190+, 135 min",
    "With a cut: Face Frame Highlight + Cut/Style — $260, 150 min",
    "Balayage + Style — $370+, 195 min",
    "With a cut: Balayage + Cut/Style — $400, 210 min"
  ]},
  { cat: "Smoothing Treatments", rows: [
    "Cezanne Keratin Express Treatment — $220+, 120 min (lasts about 3 months)",
    "Cezanne Keratin Smoothing Treatment — $400+, 180 min (lasts about 5 months)",
    "Blonde Keratin Treatment — $200+, 120 min"
  ]},
  { cat: "Extensions", rows: [
    "Tape Extension Installation — $435+, 90 min ($75 deposit for new clients)",
    "Tape Extension Move Up — $250+, 150 min ($175 deposit)",
    "Sew-In Micro Weft Installation — $500+, 180 min (hair not included)"
  ]},
  { cat: "Add-ons (picked as extras when booking)", rows: [
    "Add On Full Highlights — $220+, 60 min",
    "Add On Face Frame Highlights — $90+, 30 min",
    "Add On Partial Highlights — $150+, 45 min",
    "Add On Color Retouch — $100+, 45 min",
    "Extra Product Charge — $30, 10 min",
    "Conditioning Treatment — $20, 10 min",
    "Malibu Treatment — $20, 10 min"
  ]}
];

// On GlossGenius but left off the website for now.
var HIDDEN_SERVICES = [
  "Bang Trim — $20, 15 min",
  "Perm + Cut/Style — $230+, 145 min",
  "Sew-In Micro Weft Removal — $75, 30 min",
  "Sew-In Weft Move Up — $200+, 120 min",
  "Extension Removal — $75, 45 min",
  "Replace Hair Extensions — $250, 150 min",
  "Express Blonde Keratin Treatment — $200+, 120 min",
  "Cezanne Ultimate Blonde Treatment — $400+, 180 min",
  "Tape Extension Removal / Reinstall — $250+, 150 min"
];

var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildSalonForm() {
  var form = FormApp.create("Looking Glass Salon: website info");
  form.setDescription(
    "Hi Brandie! This fills in the parts of your new website that still say \"To be confirmed\".\n\n" +
    "Skip anything you're not sure about. You can come back and change your answers later " +
    "with the link you get at the end.\n\n" +
    "See the site here: https://mcgee2262.github.io/looking-glass-salon/");
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setCollectEmail(false);
  form.setConfirmationMessage("Thank you! Your answers are saved. Text any photos straight to me.");

  // 1. Contact and location
  form.addTextItem().setTitle("Your name").setRequired(true);
  form.addTextItem().setTitle("Your phone number").setHelpText("So I can text you if I have a question.").setRequired(true);

  section(form, "Contact and location", "This goes on the Visit page.");
  form.addTextItem().setTitle("Salon street address").setHelpText("Include the suite or unit number, city and ZIP.");
  form.addParagraphTextItem().setTitle("Parking and how to find the door")
    .setHelpText("For example: free lot out front, enter through the side door, suite is upstairs.");
  form.addTextItem().setTitle("Phone number for clients");
  form.addMultipleChoiceItem().setTitle("Can this phone number be shown on the website?")
    .setChoiceValues(["Yes, show it", "No, keep it off the site"]);
  form.addMultipleChoiceItem().setTitle("Can clients text that number?")
    .setChoiceValues(["Yes, texting is fine", "Calls only"]);
  form.addTextItem().setTitle("Email for clients");

  // 2. Hours
  section(form, "Hours", "Type the hours for each day, like \"9am–5pm\" or \"Closed\".");
  form.addMultipleChoiceItem().setTitle("How do your hours work?")
    .setChoiceValues(["Set hours every week", "By appointment only", "Mix of both"])
    .showOtherOption(true);
  DAYS.forEach(function (d) { form.addTextItem().setTitle(d); });
  form.addParagraphTextItem().setTitle("Anything else about hours?")
    .setHelpText("Holidays, late nights, every other Saturday, etc.");

  // 3. Social
  section(form, "Social media", "Paste a link or your @name. These go in the website footer.");
  form.addTextItem().setTitle("Instagram");
  form.addTextItem().setTitle("Facebook");
  form.addTextItem().setTitle("TikTok");
  form.addTextItem().setTitle("Google Business / Google Maps link");

  // 4. About her
  section(form, "About you", "This goes on the About page. Write it how you'd say it to a new client.");
  form.addParagraphTextItem().setTitle("Your story")
    .setHelpText("How you got into hair, what you love about it, what clients can expect in your chair.");
  form.addTextItem().setTitle("How many years have you been doing hair?");
  form.addParagraphTextItem().setTitle("Training, certifications or brands you use");
  form.addCheckboxItem().setTitle("What do you most want to be known for?")
    .setChoiceValues(["Blondes and highlights", "Balayage", "Color and color fixes", "Vivid / fashion colors",
      "Cuts", "Keratin smoothing", "Extensions"])
    .showOtherOption(true);
  form.addTextItem().setTitle("One fun fact about you (optional)");

  // 5. Policies
  section(form, "Policies", "These show on the Visit and booking pages.");
  form.addParagraphTextItem().setTitle("Cancellation and no-show policy")
    .setHelpText("How much notice you need, and what happens if someone cancels late or doesn't show.");
  form.addParagraphTextItem().setTitle("Running late policy");
  form.addParagraphTextItem().setTitle("Deposits")
    .setHelpText("Which services need one, how much, and whether it comes off the final price.");
  form.addCheckboxItem().setTitle("Payment you accept")
    .setChoiceValues(["Cash", "Credit / debit card", "Apple Pay", "Venmo", "Zelle", "Cash App"])
    .showOtherOption(true);
  form.addMultipleChoiceItem().setTitle("Can clients bring kids or a guest?")
    .setChoiceValues(["Yes", "No", "Please ask first"]);
  form.addMultipleChoiceItem().setTitle("Do new clients need a consultation before color or extensions?")
    .setChoiceValues(["Yes, always", "Only for big changes or color fixes", "No"]);

  // 6. Services check
  section(form, "Check your services and prices",
    "These were copied from your GlossGenius page. For each one pick Correct, Change it or Remove it. " +
    "Write the right price and time in the box under each group. \"+\" means \"starts at\".");
  SERVICE_GROUPS.forEach(function (g) {
    form.addGridItem().setTitle(g.cat).setRows(g.rows).setColumns(["Correct", "Change it", "Remove it"]);
    form.addParagraphTextItem().setTitle("Changes for " + g.cat)
      .setHelpText("For example: Men's Haircut is $75 and 30 min.");
  });
  form.addCheckboxItem().setTitle("These are on GlossGenius but not on the website. Check any you want added.")
    .setChoiceValues(HIDDEN_SERVICES);
  form.addParagraphTextItem().setTitle("Any services missing completely?")
    .setHelpText("Name, price and how long it takes.");

  // 7. Booking
  section(form, "Booking", "Right now the booking page on the site is only a preview. Nothing gets sent.");
  form.addMultipleChoiceItem().setTitle("How should clients actually book?")
    .setChoiceValues(["Keep using GlossGenius for real bookings", "Call or text me", "Send me a booking request by email"])
    .showOtherOption(true);
  form.addParagraphTextItem().setTitle("Anything you want clients to know before booking?");

  // 8. Photos and look
  section(form, "Photos and look", "");
  form.addMultipleChoiceItem().setTitle("Do you like the logo and colors on the site?")
    .setChoiceValues(["Love it, keep it", "Mostly, small changes", "I want something different"]);
  form.addParagraphTextItem().setTitle("What would you change about the look?");
  form.addMultipleChoiceItem().setTitle("Do you have more photos you want on the site?")
    .setHelpText("Text them to me. Only send ones the client said are OK to share.")
    .setChoiceValues(["Yes, I'll text them", "No, what's there is good"]);
  form.addParagraphTextItem().setTitle("Any photos on the site you want taken down?")
    .setHelpText("Describe them, for example \"the purple bob on the Gallery page\".");

  // 9. Domain and anything else
  section(form, "Web address and anything else", "");
  form.addMultipleChoiceItem().setTitle("Do you own a web address (like lookingglasssalon.com)?")
    .setChoiceValues(["Yes", "No, but I want one", "No, the current link is fine"]);
  form.addTextItem().setTitle("If yes, what is it? If no, any name you'd like?");
  form.addParagraphTextItem().setTitle("Anything wrong or missing on the website?");

  var sheet = SpreadsheetApp.create("Looking Glass Salon: website info (answers)");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  // Newer Google accounts create forms unpublished; publish so the link works.
  try { form.setPublished(true); } catch (e) {}

  Logger.log("Send this link to Brandie: " + form.getPublishedUrl());
  Logger.log("Edit the form: " + form.getEditUrl());
  Logger.log("Answers spreadsheet: " + sheet.getUrl());
}

function section(form, title, help) {
  form.addPageBreakItem().setTitle(title).setHelpText(help);
}
