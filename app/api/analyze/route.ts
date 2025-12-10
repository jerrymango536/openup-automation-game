import { NextRequest, NextResponse } from 'next/server';
import { analyzeIdea } from '@/lib/gemini';

// Manual analysis endpoint (for testing or re-analysis)
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const result = await analyzeIdea(content.trim());

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze idea' },
      { status: 500 }
    );
  }
}
