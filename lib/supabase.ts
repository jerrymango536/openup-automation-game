import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Idea } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if env vars are set
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Dummy client for build time - will error at runtime if used
  supabase = null as unknown as SupabaseClient;
}

export { supabase };

// Session operations
export async function createSession(name: string): Promise<Session> {
  const code = generateSessionCode();

  const { data, error } = await supabase
    .from('sessions')
    .insert({ code, name, is_active: true })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSession(code: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data;
}

// Idea operations
export async function submitIdea(
  sessionId: string,
  content: string,
  authorName?: string
): Promise<Idea> {
  const { data, error } = await supabase
    .from('ideas')
    .insert({
      session_id: sessionId,
      content,
      author_name: authorName || null,
      category: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIdeaCategory(
  ideaId: string,
  category: string,
  reasoning: string
): Promise<void> {
  const { error } = await supabase
    .from('ideas')
    .update({ category, ai_reasoning: reasoning })
    .eq('id', ideaId);

  if (error) throw error;
}

export async function getSessionIdeas(sessionId: string): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select()
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Subscribe to realtime idea changes
export function subscribeToIdeas(
  sessionId: string,
  onInsert: (idea: Idea) => void,
  onUpdate: (idea: Idea) => void
) {
  const channel = supabase
    .channel(`ideas:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ideas',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onInsert(payload.new as Idea)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ideas',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onUpdate(payload.new as Idea)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Generate a 6-character session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
