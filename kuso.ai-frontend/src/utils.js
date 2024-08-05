export const fetchOpenAIResponse = async (apiKey, messages) => {
  const result = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 150,
    }),
  });

  if (!result.ok) {
    const error = await result.json();
    console.error("Error details:", error);
    throw new Error("Network response was not ok");
  }

  const data = await result.json();
  return data.choices[0].message.content;
};
