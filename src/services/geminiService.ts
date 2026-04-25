import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type SummaryType = "concise" | "detailed" | "bullets" | "key-takeaways";
export type SummaryLength = "short" | "medium" | "long";

interface SummarizeOptions {
  type: SummaryType;
  length: SummaryLength;
  tone: string;
}

export interface GlossaryItem {
  word: string;
  definition: string;
}

export interface SummarizeResult {
  summary: string;
  glossary: GlossaryItem[];
}

export async function summarizeText(text: string, options: SummarizeOptions): Promise<SummarizeResult> {
  const { type, length, tone } = options;

  let prompt = `Analyze the following text and provide a summary and a glossary of complex/hard terms used in the text.\n\nText: ${text}\n\n`;
  
  prompt += `Summary Style: ${type}\n`;
  prompt += `Desired Length: ${length}\n`;
  prompt += `Tone: ${tone}\n\n`;

  prompt += "Requirements for the summary:\n";
  if (type === "bullets") {
    prompt += "- Present the summary as a list of bullet points.\n";
  } else if (type === "key-takeaways") {
    prompt += "- Highlight the most important takeaways with clear headings.\n";
  } else if (type === "concise") {
    prompt += "- Keep it very brief and to the point.\n";
  } else {
    prompt += "- Provide a detailed summary covering all major points.\n";
  }

  prompt += `- The summary should be ${length} in length.\n`;
  prompt += `- Maintain a ${tone} tone.\n`;

  prompt += "\nOutput format: JSON\n";
  prompt += "Expected JSON structure: { \"summary\": \"markdown string\", \"glossary\": [ { \"word\": \"string\", \"definition\": \"string\" } ] }\n";
  prompt += "Include at least 3-5 hard words in the glossary if available.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(response.text) as SummarizeResult;
    return result;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
}
