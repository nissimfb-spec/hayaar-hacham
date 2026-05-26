exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { message, system } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = system ? `${system}\n\n${message}` : message;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000 }
      })
    });

    const data = await res.json();
    console.log('Gemini response:', JSON.stringify(data));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return { statusCode: 200, headers, body: JSON.stringify({ text: 'שגיאה: תגובה ריקה', debug: data }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ text }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
