"use strict"
const { mailer } = require("./nodeMailer.cjs");
(async()=>{
const users = [
    // { email: "benawumee79@gmail.com", password: "abc123" },
    // { email: "richmondnyarko123@gmail.com", password: "abc123" },
    { email: "richmondnyarko123@gmail.com", password: "abc123" },
];
// { email: "bob@example.com", password: "xyz789" },

  for (const user of users) {
    const subject = "Your Account Details";
    const text = `Hello, your ghanbs is: ${user.password}`;
    const html = `<p>Hello, your password is: <strong>${user.password}</strong></p>`;
  
    try {
      await mailer("hehoda@polkaroad.net", user.email, subject, text, html);
      console.log(`Email sent to ${user.email}`);
    } catch (err) {
      console.error(`Failed to send email to ${user.email}`, err);
    }
  }
})()