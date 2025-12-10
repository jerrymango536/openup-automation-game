'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';

interface IdeaInputProps {
  onSubmit: (idea: string) => Promise<void>;
  disabled?: boolean;
}

export default function IdeaInput({ onSubmit, disabled }: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(idea.trim());
      setIdea('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="What process would you like to automate?"
          disabled={disabled || isSubmitting}
          rows={3}
          className="w-full resize-none pr-24"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <motion.button
          type="submit"
          disabled={!idea.trim() || isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            absolute right-2 bottom-2
            btn-primary
            px-4 py-2 text-sm
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending
            </span>
          ) : (
            'Submit'
          )}
        </motion.button>
      </div>
      <p className="mt-2 text-xs text-[var(--foreground-muted)]">
        Press Enter to submit, Shift+Enter for new line
      </p>
    </form>
  );
}
