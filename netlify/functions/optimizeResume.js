const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed, use POST" }),
    };
  }

  try {
    const { resumeText, jobDescription } = JSON.parse(event.body);

    if (!resumeText || !jobDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing resumeText or jobDescription" }),
      };
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    const model = "dslim/bert-base-NER"; // Hugging Face model for NER

    async function extractEntities(text) {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(`HF API error: ${JSON.stringify(data)}`);
      }

      // Extract only unique words
      return [...new Set(data.map((item) => item.word))];
    }

    // Extract keywords from resume + job description
    const resumeEntities = await extractEntities(resumeText);
    const jobEntities = await extractEntities(jobDescription);

    // Find matches & missing skills
    const matched = resumeEntities.filter((word) =>
      jobEntities.includes(word)
    );
    const missing = jobEntities.filter((word) => !resumeEntities.includes(word));

    const matchScore =
      jobEntities.length > 0
        ? Math.round((matched.length / jobEntities.length) * 100)
        : 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        matchScore,
        matched,
        missing,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
        
