import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult } from './types';
import { getSettings } from './settings';

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

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

export async function analyzeIdea(idea: string): Promise<AnalysisResult> {
  console.log('[Claude] Starting analysis for:', idea.substring(0, 50) + '...');

  // Check if API key is set
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[Claude] ANTHROPIC_API_KEY is not set!');
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  console.log('[Claude] API key found (length:', apiKey.length, ')');

  const client = new Anthropic({ apiKey });

  // Get settings from database
  let modelName = DEFAULT_MODEL;
  let promptTemplate = DEFAULT_PROMPT;

  try {
    console.log('[Claude] Fetching settings from database...');
    const settings = await getSettings(['ai_model', 'ai_prompt']);
    if (settings.ai_model) modelName = settings.ai_model;
    if (settings.ai_prompt) promptTemplate = settings.ai_prompt;
    console.log('[Claude] Using model:', modelName);
  } catch (error) {
    console.warn('[Claude] Could not load settings, using defaults:', error);
  }

  const prompt = promptTemplate.replace('{idea}', idea);

  try {
    console.log('[Claude] Calling Claude API...');
    const message = await client.messages.create({
      model: modelName,
      max_tokens: 256,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    console.log('[Claude] Raw response:', text);

    // Parse the JSON response (handle potential markdown wrapping)
    let jsonText = text;
    if (text.startsWith('```')) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonText = match[1].trim();
    }

    const parsed = JSON.parse(jsonText);
    console.log('[Claude] Parsed response:', parsed);

    // Validate the category
    if (!['quick-win', 'achievable', 'moonshot'].includes(parsed.category)) {
      console.error('[Claude] Invalid category:', parsed.category);
      throw new Error('Invalid category: ' + parsed.category);
    }

    return {
      category: parsed.category,
      reasoning: parsed.reasoning || 'Analysis complete.',
    };
  } catch (error) {
    console.error('[Claude] Analysis error:', error);
    throw error;
  }
}
