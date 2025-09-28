// netlify/functions/parseJob.js
const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed, use POST" }),
      };
    }

    const { jobDescription } = JSON.parse(event.body);

    if (!jobDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing jobDescription" }),
      };
    }

    // Call HuggingFace API (replace with your chosen model)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: jobDescription }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error: ${errorText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Job description parsed successfully",
        data,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
          
