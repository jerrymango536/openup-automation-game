'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Idea, Category, CATEGORY_INFO } from '@/lib/types';
import IdeaCard from './IdeaCard';

interface KanbanBoardProps {
  ideas: Idea[];
}

const COLUMNS: Category[] = ['quick-win', 'achievable', 'moonshot'];

export default function KanbanBoard({ ideas }: KanbanBoardProps) {
  const pendingIdeas = ideas.filter((idea) => idea.category === 'pending');

  return (
    <div className="relative z-10 h-full flex flex-col">
      {/* Pending ideas - horizontal strip at top */}
      <AnimatePresence>
        {pendingIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--pending)' }}
              />
              <span
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: 'var(--pending)' }}
              >
                Analyzing ({pendingIdeas.length})
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <AnimatePresence mode="popLayout">
                {pendingIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    className="flex-shrink-0 w-64"
                  >
                    <IdeaCard idea={idea} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main kanban columns */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {COLUMNS.map((category) => {
          const categoryInfo = CATEGORY_INFO[category];
          const columnIdeas = ideas.filter((idea) => idea.category === category);

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
            >
              {/* Column header */}
              <div className="mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryInfo.emoji}</span>
                  <div>
                    <h2
                      className="text-lg font-bold"
                      style={{ color: categoryInfo.color }}
                    >
                      {categoryInfo.label}
                    </h2>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {categoryInfo.description}
                    </p>
                  </div>
                  <span
                    className="ml-auto px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: categoryInfo.bgColor,
                      color: categoryInfo.color,
                    }}
                  >
                    {columnIdeas.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                <AnimatePresence mode="popLayout">
                  {columnIdeas.map((idea, index) => (
                    <IdeaCard key={idea.id} idea={idea} index={index} />
                  ))}
                </AnimatePresence>

                {columnIdeas.length === 0 && (
                  <div
                    className="h-32 rounded-xl border-2 border-dashed flex items-center justify-center"
                    style={{
                      borderColor: `color-mix(in srgb, ${categoryInfo.color} 20%, transparent)`,
                    }}
                  >
                    <span className="text-sm text-[var(--foreground-muted)]">
                      Ideas will appear here
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
