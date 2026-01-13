const postmark = require('postmark')

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

async function sendEmail(to, subject, text) {
  try {
    const result = await client.sendEmail({
      From: process.env.FROM_EMAIL,
      To: to,
      Subject: subject,
      TextBody: text
    });
    console.log(`Email sent to ${to}: ${result.MessageID}`)
  } catch (err) {
    console.error('Error sending email:', err)
  }
}

module.exports = { sendEmail }