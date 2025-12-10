'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Session, Idea } from '@/lib/types';
import { getSessionIdeas, subscribeToIdeas } from '@/lib/supabase';
import KanbanBoard from '@/components/KanbanBoard';
import SessionCode from '@/components/SessionCode';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function HostDashboard({ params }: PageProps) {
  const { code } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch session and ideas
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

        // Fetch existing ideas
        const existingIdeas = await getSessionIdeas(session.id);
        setIdeas(existingIdeas);
      } catch {
        setError('Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [code, router]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!session) return;

    const unsubscribe = subscribeToIdeas(
      session.id,
      (newIdea) => {
        setIdeas((prev) => {
          // Avoid duplicates
          if (prev.some((i) => i.id === newIdea.id)) return prev;
          return [...prev, newIdea];
        });
      },
      (updatedIdea) => {
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === updatedIdea.id ? updatedIdea : idea
          )
        );
      }
    );

    return unsubscribe;
  }, [session]);

  if (isLoading) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)]">Loading session...</p>
        </motion.div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center">
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const sessionUrl = `${appUrl}/session/${code}`;

  return (
    <main className="relative z-10 min-h-screen flex flex-col p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-6 mb-6"
      >
        {/* Session info */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-bold">{session.name}</h1>
          </div>
          <p className="text-sm text-[var(--foreground-muted)]">
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {/* QR Code and session code */}
        <SessionCode code={code} sessionUrl={sessionUrl} />
      </motion.header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {ideas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-xl font-bold mb-2">Waiting for ideas...</h2>
            <p className="text-[var(--foreground-muted)] max-w-md">
              Share the QR code or room code with participants.
              <br />
              Ideas will appear here as they&apos;re submitted.
            </p>
          </motion.div>
        ) : (
          <KanbanBoard ideas={ideas} />
        )}
      </div>
    </main>
  );
}
