import { BasicTokenInfo } from '@/types';
import config from '@/config';

// Helper to truncate data if it's too long for the prompt
function truncateData(data: any, maxLength: number = 15000): string { // Max length for context
  let stringified = JSON.stringify(data, null, 2);
  if (stringified.length > maxLength) {
    // Basic truncation, can be made smarter
    stringified = stringified.substring(0, maxLength) + "... (data truncated)";
  }
  return stringified;
}

export async function getAISummaryForToken(tokenData: BasicTokenInfo): Promise<string> {
  if (!config.env.openrouterApiKey) { // Corrected to access key from config.env
    console.warn("OpenRouter API key not found. Skipping AI summary.");
    return "AI summary not available: API key missing.";
  }

  const truncatedTokenDataString = truncateData(tokenData);

  const prompt = `
You are a crypto token analyst. Based on the following comprehensive data for a token, provide a concise summary and an assessment.
The data includes real-time market statistics, project information, links, community signals, and developer activity.

Token Data:
\`\`\`json
${truncatedTokenDataString}
\`\`\`

Please structure your response into the following sections:
1.  **Overall Summary:** A brief overview of the token (name, symbol), its primary purpose or utility from its description, and any standout features.
2.  **Market Snapshot:** Briefly comment on its current market cap, 24-hour trading volume. Mention total supply and circulating supply. Note any significant recent price trends if available in the data (e.g., price_change_percentage_24h, price_change_percentage_7d).
3.  **Project & Community Insights:** Highlight key aspects from its description. List its homepage URL. Mention available official community channels/social links (e.g., Telegram, Twitter) and Telegram user count if present.
4.  **Developer Activity Signals:** Briefly comment on any notable developer signals from the developer_data section (e.g., commit activity, GitHub stars).
5.  **Assessment (Data-Driven):** Provide a neutral, data-driven perspective. What does the data suggest about this token? Highlight potential points of interest or caution *based strictly on the provided data*. Do NOT invent information.
6.  **Important Disclaimer:** Remind the user that this analysis is based on provided data, is not financial advice, and they should conduct their own thorough research (DYOR). Explicitly state that detailed on-chain holder analysis and smart contract audit results were not part of the input data for this summary.

Focus on summarizing the provided data. Be factual and objective. Do not make investment recommendations.
Provide the output in well-formatted markdown.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.env.openrouterApiKey}`, // Corrected to access key from config.env
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.api.openrouter.model || "openai/gpt-3.5-turbo", // Corrected to access model from config.api.openrouter
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter API Error:", response.status, errorBody);
      return `AI summary generation failed: ${response.statusText}. Details: ${errorBody}`;
    }

    const result = await response.json();
    return result.choices[0]?.message?.content?.trim() || "AI generated an empty response.";
  } catch (error: any) {
    console.error("Error calling OpenRouter:", error);
    return `AI summary generation failed: ${error.message}`;
  }
}
