const { default: axios } = require("axios");

const geminiSetup = async (prompt) => {
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }
  );

  const response = data.candidates[0].content.parts[0].text;

  const startIndex = response.indexOf("[");
  const endIndex = response.lastIndexOf("]");
  const removeUnwantedText = response.slice(startIndex, endIndex + 1);

  // convert string to json
  const questions = JSON.parse(removeUnwantedText);

  return questions;
};

module.exports = geminiSetup;