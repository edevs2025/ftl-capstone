export const fetchOpenAIResponse = async (apiKey, messages, userMessage) => {
  const fullPrompt = [...messages, { role: "user", content: userMessage }];
  const result = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: fullPrompt,
      max_tokens: 150,
    }),
  });

  if (!result.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await result.json();
  return data.choices[0].message.content;
};
