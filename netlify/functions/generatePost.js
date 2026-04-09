const axios = require('axios');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY
      }
    });

    const postText = response.data.content.map(b => b.text || '').join('').trim();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ post: postText }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ 
        error: 'Failed to generate post',
        details: error.message 
      }),
    };
  }
};