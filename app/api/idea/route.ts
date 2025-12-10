import { NextRequest, NextResponse } from 'next/server';
import { submitIdea, updateIdeaCategory } from '@/lib/supabase';
import { analyzeIdea } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  console.log('[API/idea] Received request');

  try {
    const { sessionId, content, authorName } = await request.json();
    console.log('[API/idea] Parsed body:', { sessionId, contentLength: content?.length, authorName });

    if (!sessionId || !content?.trim()) {
      console.log('[API/idea] Missing required fields');
      return NextResponse.json(
        { error: 'Session ID and content are required' },
        { status: 400 }
      );
    }

    // Create the idea first (with 'pending' category)
    console.log('[API/idea] Submitting idea to Supabase...');
    const idea = await submitIdea(sessionId, content.trim(), authorName);
    console.log('[API/idea] Idea created:', idea.id);

    // Analyze and update - AWAIT this so serverless function doesn't terminate early
    console.log('[API/idea] Starting Gemini analysis...');
    try {
      const result = await analyzeIdea(content.trim());
      console.log('[API/idea] Gemini result:', result);

      await updateIdeaCategory(idea.id, result.category, result.reasoning);
      console.log('[API/idea] Category updated successfully');
    } catch (analysisError) {
      console.error('[API/idea] Analysis failed:', analysisError);
      // Update with fallback so it doesn't stay stuck
      await updateIdeaCategory(idea.id, 'achievable', 'Analysis unavailable - please try again');
    }

    return NextResponse.json({ idea });
  } catch (error) {
    console.error('[API/idea] Submit idea error:', error);
    return NextResponse.json(
      { error: 'Failed to submit idea' },
      { status: 500 }
    );
  }
}
