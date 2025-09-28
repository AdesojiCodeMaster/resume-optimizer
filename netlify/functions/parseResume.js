const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
      // Expect resume file URL sent in request body
          const { resumeUrl } = JSON.parse(event.body);

              if (!resumeUrl) {
                    return { statusCode: 400, body: "Missing resumeUrl" };
                        }

                            // Call Affinda API
                                const response = await fetch("https://api.affinda.com/v2/resumes", {
                                      method: "POST",
                                            headers: {
                                                    "Authorization": `Bearer ${process.env.AFFINDA_API_KEY}`,
                                                            "Content-Type": "application/json"
                                                                  },
                                                                        body: JSON.stringify({ url: resumeUrl })
                                                                            });

                                                                                const data = await response.json();

                                                                                    return {
                                                                                          statusCode: 200,
                                                                                                body: JSON.stringify(data)
                                                                                                    };

                                                                                                      } catch (error) {
                                                                                                          return { statusCode: 500, body: error.toString() };
                                                                                                            }
                                                                                                            };
                                                                                                            