require("dotenv").config();
const XLSX = require("xlsx");
const { mailer } = require("./nodeMailer");

const workbook = XLSX.readFile("awutu-voters_with_passwords.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const voters = XLSX.utils.sheet_to_json(sheet);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  for (const voter of voters) {
    const email = voter["EMAIL"];
    const fullName = `${voter["SURNAME"]} ${voter["OTHER NAME (S)"]}`.trim();
    const password = voter["Password"];

    if (!email || !password) {
      console.warn("⚠️ Skipping invalid row:", voter);
      continue;
    }

    const subject = "Your NSS Voting Password";
    const text = `${fullName}, your unique password is: ${password}. Cast your vote at https://nss-awutusenya.netlify.app. Voting starts at 9:00 AM GMT and ends at 4:00 PM GMT. Keep your password private. Thank you for voting!`;
    const html = `<p><strong>${fullName}</strong>, your unique password is: <strong>${password}</strong>.</p>
                  <p>Cast your vote at <a href="https://nss-awutusenya.netlify.app">this link</a>.</p>
                  <p><strong>Voting time:</strong> 9:00 AM – 4:00 PM GMT.</p>
                  <p><em>Keep your password private. Thank you for voting!</em></p>`;

    await mailer(process.env.MAILER_USER, email, subject, text, html);
    await delay(500); // Slow down sending
  }
})();
