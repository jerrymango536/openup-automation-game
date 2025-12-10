import { NextRequest, NextResponse } from 'next/server';
import { submitIdea, updateIdeaCategory } from '@/lib/supabase';
import { analyzeIdea } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, content, authorName } = await request.json();

    if (!sessionId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Session ID and content are required' },
        { status: 400 }
      );
    }

    // Create the idea first (with 'pending' category)
    const idea = await submitIdea(sessionId, content.trim(), authorName);

    // Analyze in the background (don't await - let it update via realtime)
    analyzeAndUpdate(idea.id, content.trim());

    return NextResponse.json({ idea });
  } catch (error) {
    console.error('Submit idea error:', error);
    return NextResponse.json(
      { error: 'Failed to submit idea' },
      { status: 500 }
    );
  }
}

async function analyzeAndUpdate(ideaId: string, content: string) {
  try {
    const result = await analyzeIdea(content);
    await updateIdeaCategory(ideaId, result.category, result.reasoning);
  } catch (error) {
    console.error('Analysis error:', error);
    // Update with fallback
    await updateIdeaCategory(ideaId, 'achievable', 'Analysis unavailable');
  }
}
