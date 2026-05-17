const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendMail = async (to, subject, text) => {
  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to,
    subject,
    html: `<p>${text}</p>`,
  });
};
