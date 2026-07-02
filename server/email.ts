const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || "sendgrid").toLowerCase().trim();

const SENDER_EMAIL = "noreply@thispagedoesnotexist12345.us";
const SENDER_NAME = "The Ultimate Journey";

async function sendViaSendGrid(options) {
  if (!SENDGRID_API_KEY) return { success: false, error: "Missing API Key" };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }], subject: options.subject }],
      from: { email: SENDER_EMAIL, name: SENDER_NAME },
      content: [{ type: "text/html", value: options.html }]
    })
  });
  return { success: res.ok };
}

async function sendViaBrevo(options) {
  if (!BREVO_API_KEY) return { success: false, error: "Missing API Key" };
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.html
    })
  });
  return { success: res.ok };
}

export async function sendInternalNotification(userEmail, firstName, tier) {
  const options = {
    to: "k.clark7@gmail.com",
    subject: `[Test Alert] ${firstName}`,
    html: `<p>New signup test: ${userEmail} (${tier})</p>`
  };
  return EMAIL_PROVIDER === "brevo" ? await sendViaBrevo(options) : await sendViaSendGrid(options);
}
