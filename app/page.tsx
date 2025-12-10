'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sessionName.trim() }),
      });

      if (!res.ok) throw new Error('Failed to create session');

      const { session } = await res.json();
      router.push(`/session/${session.code}/host`);
    } catch {
      setError('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/session?code=${joinCode.trim().toUpperCase()}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError('Session not found. Check the code and try again.');
        } else {
          throw new Error('Failed to join session');
        }
        return;
      }

      const { session } = await res.json();
      router.push(`/session/${session.code}`);
    } catch {
      setError('Failed to join session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block mb-4"
          >
            <span className="text-5xl">🤖</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 text-glow-cyan">
            Automation<br />Ideation
          </h1>
          <p className="text-[var(--foreground-muted)]">
            What should we automate next?
          </p>
        </div>

        {/* Mode selection */}
        {mode === 'choose' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('create')}
              className="w-full btn-primary text-lg py-4"
            >
              Start a Session
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('join')}
              className="w-full btn-secondary text-lg py-4"
            >
              Join a Session
            </motion.button>
          </motion.div>
        )}

        {/* Create session form */}
        {mode === 'create' && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                Session Name
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Q1 Automation Ideas"
                className="w-full"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('choose');
                  setError('');
                }}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!sessionName.trim() || isLoading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Join session form */}
        {mode === 'join' && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleJoin}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                Session Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                className="w-full text-center text-2xl font-mono tracking-widest uppercase"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('choose');
                  setError('');
                }}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={joinCode.length !== 6 || isLoading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[var(--foreground-muted)] mt-12"
        >
          Powered by OpenUp • AI-First Transformation
        </motion.p>
      </motion.div>
    </main>
  );
}
