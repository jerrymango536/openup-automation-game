import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from './types';
import { getSettings } from './settings';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Default prompt as fallback
const DEFAULT_PROMPT = `You are an automation assessment expert helping a team identify automation opportunities.

Analyze this idea and categorize it based on implementation difficulty.

Idea: "{idea}"

Context: This is a business/workplace automation idea. Common tools mentioned may include:
- Greenhouse = ATS (Applicant Tracking System)
- Salesforce, HubSpot = CRM systems
- Slack, Teams = Communication platforms
- Google Sheets, Airtable = Data storage
- n8n, Zapier, Make = Automation platforms

Respond ONLY with valid JSON (no markdown, no code blocks):
{"category": "quick-win" | "achievable" | "moonshot", "reasoning": "Brief 5-10 word explanation"}

Categories:
- quick-win: Doable in hours/days with no-code tools (Zapier, n8n, Make) or simple scripts
- achievable: Needs moderate dev effort, custom integrations, or API work - but clearly doable
- moonshot: Requires advanced AI/ML, major system changes, or experimental technology

Keep reasoning SHORT and actionable.`;

const DEFAULT_MODEL = 'gemini-flash-latest';

export async function analyzeIdea(idea: string): Promise<AnalysisResult> {
  // Get settings from database
  let modelName = DEFAULT_MODEL;
  let promptTemplate = DEFAULT_PROMPT;

  try {
    const settings = await getSettings(['ai_model', 'ai_prompt']);
    if (settings.ai_model) modelName = settings.ai_model;
    if (settings.ai_prompt) promptTemplate = settings.ai_prompt;
  } catch (error) {
    console.warn('Could not load settings, using defaults:', error);
  }

  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = promptTemplate.replace('{idea}', idea);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Parse the JSON response (handle potential markdown wrapping)
    let jsonText = text;
    if (text.startsWith('```')) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonText = match[1].trim();
    }

    const parsed = JSON.parse(jsonText);

    // Validate the category
    if (!['quick-win', 'achievable', 'moonshot'].includes(parsed.category)) {
      throw new Error('Invalid category');
    }

    return {
      category: parsed.category,
      reasoning: parsed.reasoning || 'Analysis complete.',
    };
  } catch (error) {
    console.error('Gemini analysis error:', error);
    // Default to achievable if parsing fails
    return {
      category: 'achievable',
      reasoning: 'Requires further evaluation.',
    };
  }
}
