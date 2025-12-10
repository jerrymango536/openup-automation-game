'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Session, Idea, CATEGORY_INFO } from '@/lib/types';
import { subscribeToIdeas } from '@/lib/supabase';
import IdeaInput from '@/components/IdeaInput';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function ParticipantView({ params }: PageProps) {
  const { code } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/session?code=${code}`);
        if (!res.ok) {
          router.push('/');
          return;
        }

        const { session } = await res.json();
        setSession(session);
      } catch {
        setError('Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [code, router]);

  // Subscribe to updates for my ideas
  useEffect(() => {
    if (!session || myIdeas.length === 0) return;

    const unsubscribe = subscribeToIdeas(
      session.id,
      () => {}, // We don't care about new ideas from others
      (updatedIdea) => {
        setMyIdeas((prev) =>
          prev.map((idea) =>
            idea.id === updatedIdea.id ? updatedIdea : idea
          )
        );
      }
    );

    return unsubscribe;
  }, [session, myIdeas.length]);

  const handleSubmitIdea = async (content: string) => {
    if (!session) return;

    try {
      const res = await fetch('/api/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          content,
          authorName: authorName.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit idea');

      const { idea } = await res.json();
      setMyIdeas((prev) => [idea, ...prev]);
    } catch {
      setError('Failed to submit idea. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)]">Joining session...</p>
        </motion.div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-red-400 mb-4">{error || 'Session not found'}</p>
          <button onClick={() => router.push('/')} className="btn-secondary">
            Back to Home
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen flex flex-col p-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🤖</span>
          <h1 className="text-xl font-bold">{session.name}</h1>
        </div>
        <p className="text-sm text-[var(--foreground-muted)]">
          Session code: <span className="font-mono text-[var(--accent-cyan)]">{code}</span>
        </p>
      </motion.header>

      {/* Optional name input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full text-sm"
        />
      </motion.div>

      {/* Idea input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <IdeaInput onSubmit={handleSubmitIdea} />
      </motion.div>

      {/* My ideas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1"
      >
        <h2 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
          Your Ideas ({myIdeas.length})
        </h2>

        <AnimatePresence mode="popLayout">
          {myIdeas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-[var(--foreground-muted)]"
            >
              <p>No ideas submitted yet.</p>
              <p className="text-sm mt-1">What process would you like to automate?</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {myIdeas.map((idea, index) => {
                const categoryInfo = CATEGORY_INFO[idea.category];
                const isPending = idea.category === 'pending';

                return (
                  <motion.div
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      card p-4 relative
                      ${isPending ? 'animate-pulse-glow' : ''}
                    `}
                    style={{
                      borderColor: `color-mix(in srgb, ${categoryInfo.color} 30%, transparent)`,
                    }}
                  >
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: categoryInfo.bgColor,
                          color: categoryInfo.color,
                        }}
                      >
                        {categoryInfo.emoji} {categoryInfo.label}
                      </span>
                      {isPending && (
                        <span className="relative flex h-2 w-2">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: categoryInfo.color }}
                          />
                          <span
                            className="relative inline-flex rounded-full h-2 w-2"
                            style={{ backgroundColor: categoryInfo.color }}
                          />
                        </span>
                      )}
                    </div>

                    {/* Idea content */}
                    <p className="text-[var(--foreground)] text-sm">
                      {idea.content}
                    </p>

                    {/* AI reasoning */}
                    {idea.ai_reasoning && (
                      <p
                        className="mt-2 text-xs italic"
                        style={{ color: categoryInfo.color }}
                      >
                        {idea.ai_reasoning}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-[var(--foreground-muted)] mt-6"
      >
        Powered by OpenUp • AI-First Transformation
      </motion.p>
    </main>
  );
}
