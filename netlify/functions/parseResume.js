const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    const { resumeText } = JSON.parse(event.body);

    if (!resumeText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing resumeText" }),
      };
    }

    // Call HuggingFace NER model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/dslim/bert-base-NER",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: resumeText }),
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
        
