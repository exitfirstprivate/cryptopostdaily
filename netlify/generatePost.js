const https = require('https');
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    const { prompt } = JSON.parse(event.body);

    // Call Grok API
    const grokResponse = await callGrokAPI(prompt);
    const messageToSend = grokResponse;

    // Send message to Telegram
    await sendMessageToTelegram(messageToSend);
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Message sent to Telegram' })
    };
};

const callGrokAPI = (prompt) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ prompt });
        const options = {
            hostname: 'api.x.ai',
            path: '/grok',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const jsonResponse = JSON.parse(data);
                resolve(jsonResponse.response);
            });
        });

        req.on('error', (error) => {
            reject(`Error: ${error.message}`);
        });

        req.write(body);
        req.end();
    });
};

const sendMessageToTelegram = async (message) => {
    const chatId = '5744484105';
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const body = querystring.stringify({
        chat_id: chatId,
        text: message
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${botToken}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const req = https.request(options, (res) => {
            res.on('end', () => {
                resolve();
            });
        });

        req.on('error', (error) => {
            reject(`Error: ${error.message}`);
        });

        req.write(body);
        req.end();
    });
};
