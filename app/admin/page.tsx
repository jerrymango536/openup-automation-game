'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

const AI_MODELS = [
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5 (Recommended)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
];

export default function AdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [aiModel, setAiModel] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [categoryNames, setCategoryNames] = useState({
    quickWin: '',
    quickWinDesc: '',
    achievable: '',
    achievableDesc: '',
    moonshot: '',
    moonshotDesc: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');

      const { settings } = await res.json();
      setSettings(settings);

      // Populate form
      const settingsMap = new Map<string, string>(settings.map((s: Setting) => [s.key, s.value]));
      setAiModel(settingsMap.get('ai_model') ?? AI_MODELS[0].value);
      setAiPrompt(settingsMap.get('ai_prompt') ?? '');
      setCategoryNames({
        quickWin: settingsMap.get('category_quick_win_name') ?? 'Quick Wins',
        quickWinDesc: settingsMap.get('category_quick_win_description') ?? '',
        achievable: settingsMap.get('category_achievable_name') ?? 'Achievable',
        achievableDesc: settingsMap.get('category_achievable_description') ?? '',
        moonshot: settingsMap.get('category_moonshot_name') ?? 'Moonshots',
        moonshotDesc: settingsMap.get('category_moonshot_description') ?? '',
      });
    } catch (err) {
      setError('Failed to load settings. Make sure you ran the SQL seed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ai_model: aiModel,
            ai_prompt: aiPrompt,
            category_quick_win_name: categoryNames.quickWin,
            category_quick_win_description: categoryNames.quickWinDesc,
            category_achievable_name: categoryNames.achievable,
            category_achievable_description: categoryNames.achievableDesc,
            category_moonshot_name: categoryNames.moonshot,
            category_moonshot_description: categoryNames.moonshotDesc,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Settings</h1>
            <p className="text-[var(--foreground-muted)]">
              Configure AI model and prompt settings
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary"
          >
            Back to Home
          </button>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            {success}
          </div>
        )}

        {/* AI Configuration */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-[var(--accent-cyan)]">
            AI Configuration
          </h2>

          {/* Model selector */}
          <div className="mb-6">
            <label className="block text-sm text-[var(--foreground-muted)] mb-2">
              AI Model
            </label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full bg-[var(--background-elevated)] border border-white/10 rounded-lg p-3 text-[var(--foreground)]"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt editor */}
          <div>
            <label className="block text-sm text-[var(--foreground-muted)] mb-2">
              AI Prompt
            </label>
            <p className="text-xs text-[var(--foreground-muted)] mb-2">
              Use <code className="px-1 py-0.5 bg-white/10 rounded">{'{idea}'}</code> as a placeholder for the user&apos;s idea
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={16}
              className="w-full font-mono text-sm"
              placeholder="Enter the AI prompt..."
            />
          </div>
        </section>

        {/* Category Names */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-[var(--accent-cyan)]">
            Category Labels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Win */}
            <div>
              <div
                className="w-full h-2 rounded-full mb-3"
                style={{ backgroundColor: 'var(--quick-win)' }}
              />
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Quick Win Name
              </label>
              <input
                type="text"
                value={categoryNames.quickWin}
                onChange={(e) =>
                  setCategoryNames({ ...categoryNames, quickWin: e.target.value })
                }
                className="w-full mb-2"
              />
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Description
              </label>
              <input
                type="text"
                value={categoryNames.quickWinDesc}
                onChange={(e) =>
                  setCategoryNames({ ...categoryNames, quickWinDesc: e.target.value })
                }
                className="w-full"
              />
            </div>

            {/* Achievable */}
            <div>
              <div
                className="w-full h-2 rounded-full mb-3"
                style={{ backgroundColor: 'var(--achievable)' }}
              />
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Achievable Name
              </label>
              <input
                type="text"
                value={categoryNames.achievable}
                onChange={(e) =>
                  setCategoryNames({ ...categoryNames, achievable: e.target.value })
                }
                className="w-full mb-2"
              />
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Description
              </label>
              <input
                type="text"
                value={categoryNames.achievableDesc}
                onChange={(e) =>
                  setCategoryNames({ ...categoryNames, achievableDesc: e.target.value })
                }
                className="w-full"
              />
            </div>

            {/* Moonshot */}
            <div>
              <div
                className="w-full h-2 rounded-full mb-3"
                style={{ backgroundColor: 'var(--moonshot)' }}
              />
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Moonshot Name
              </label>
              <input
                type="text"
                value={categoryNames.moonshot}
                onChange={(e) =>
                  setCategoryNames({ ...categoryNames, moonshot: e.target.value })
                }
                className="w-full mb-2"
              />
              <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                Description
              </label>
              <input
                type="text"
                value={categoryNames.moonshotDesc}
                onChange={(e) =>
                  setCategoryNames({ ...categoryNames, moonshotDesc: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
