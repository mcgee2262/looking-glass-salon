# Owner info form

A Google Form for Brandie (Mama Ryan) that asks for everything the site still shows as "To be confirmed": address, parking, phone, email, hours, social links, her story, policies, booking, photos and domain. It also has a price check of every service copied from GlossGenius.

## Make the form (about 2 minutes)
1. Go to https://script.google.com and sign in with your Google account.
2. Click **New project**. Delete the sample code, then paste in everything from `build-form.gs`.
3. Click **Run** (with `buildSalonForm` selected at the top).
4. Google asks for permission. Click **Review permissions**, pick your account, then **Advanced** > **Go to project (unsafe)** > **Allow**. This shows up because you wrote the script yourself; it only touches your own Drive.
5. Open **Execution log** at the bottom. It shows three links:
   - **Send this link to Brandie:** the form she fills out.
   - **Edit the form:** where you can change questions.
   - **Answers spreadsheet:** where her answers land.

Only run it once. Every run makes a new copy of the form.

## Message to send her
> Hi Mama Ryan! Your website is almost ready. Can you fill this out when you get a chance? It's the info I still need: address, hours, your story, policies and a quick check of your prices. Skip anything you're not sure about, and you can come back to change answers later. Text me any photos you want added. Here's the site so far: https://mcgee2262.github.io/looking-glass-salon/
> [form link]

## When her answers come in
Copy her answers from the answers spreadsheet into `js/content.js`, which feeds the whole site:
- Address and parking go in `SALON.location`. Phone, email and hours go in `SALON.phone`, `SALON.email` and `SALON.hours`.
- Social links go in `SALON.social`. Her story goes in `SALON.owner.bio`, and her cancellation policy goes in `SALON.policies.cancellation`.
- Price and time changes go in `SERVICES` and `ADDONS`. Services she checked to add move from `MORE_SERVICES` into `SERVICES`.
- Once everything is approved, take off `noindex` and the draft banner.
