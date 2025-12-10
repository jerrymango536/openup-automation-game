'use client';

import { motion } from 'framer-motion';
import { Idea, CATEGORY_INFO } from '@/lib/types';

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

export default function IdeaCard({ idea, index }: IdeaCardProps) {
  const categoryInfo = CATEGORY_INFO[idea.category];
  const isPending = idea.category === 'pending';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        layout: { duration: 0.3 },
      }}
      className={`
        relative p-4 rounded-xl
        border border-white/10
        ${isPending ? 'animate-pulse-glow' : ''}
      `}
      style={{
        background: categoryInfo.bgColor,
        borderColor: `color-mix(in srgb, ${categoryInfo.color} 30%, transparent)`,
      }}
    >
      {/* Analyzing indicator */}
      {isPending && (
        <div className="absolute -top-2 -right-2">
          <span className="relative flex h-4 w-4">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: categoryInfo.color }}
            />
            <span
              className="relative inline-flex rounded-full h-4 w-4"
              style={{ backgroundColor: categoryInfo.color }}
            />
          </span>
        </div>
      )}

      {/* Idea content */}
      <p className="text-[var(--foreground)] text-sm leading-relaxed mb-3">
        {idea.content}
      </p>

      {/* Author and reasoning */}
      <div className="flex items-start justify-between gap-2">
        {idea.author_name && (
          <span className="text-xs text-[var(--foreground-muted)]">
            — {idea.author_name}
          </span>
        )}
        {idea.ai_reasoning && (
          <span
            className="text-xs italic ml-auto max-w-[60%] text-right"
            style={{ color: categoryInfo.color }}
          >
            {idea.ai_reasoning}
          </span>
        )}
      </div>

      {/* Subtle glow line at bottom */}
      <div
        className="absolute bottom-0 left-4 right-4 h-px opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, ${categoryInfo.color}, transparent)`,
        }}
      />
    </motion.div>
  );
}
