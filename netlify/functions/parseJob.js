import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed, use POST" }),
    };
  }

  try {
    const { jobDescription } = JSON.parse(event.body);
    if (!jobDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing jobDescription" }),
      };
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    const model = "dslim/bert-base-NER"; // ✅ make sure this is correct

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: jobDescription }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `HF API error: ${errorText}` }),
      };
    }

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
