const postmark = require('postmark')

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)

const sendPriceAlert = async ({ to, productTitle, productUrl, currentPrice, targetPrice }) => {
    await client.sendEmail({
        From: process.env.FROM_EMAIL,
        To: to,
        Subject: `Price drop: ${productTitle}`,
        HtmlBody: `
            <h2>Good news — a product you're tracking just dropped in price!</h2>
            <p><strong>${productTitle}</strong></p>
            <p>Current price: <strong>$${Number(currentPrice).toFixed(2)}</strong></p>
            <p>Your target price: $${Number(targetPrice).toFixed(2)}</p>
            <p><a href="${productUrl}">View product</a></p>
        `,
        TextBody: `Price drop: ${productTitle}\nCurrent price: $${Number(currentPrice).toFixed(2)}\nYour target: $${Number(targetPrice).toFixed(2)}\n${productUrl}`,
        MessageStream: 'outbound'
    })
}

module.exports = { sendPriceAlert }
