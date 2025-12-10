'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionCodeProps {
  code: string;
}

export default function SessionCode({ code }: SessionCodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sessionUrl, setSessionUrl] = useState('');

  // Get the URL dynamically on client side
  useEffect(() => {
    const baseUrl = window.location.origin;
    setSessionUrl(`${baseUrl}/session/${code}`);
  }, [code]);

  if (!sessionUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card overflow-hidden"
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📱</span>
          <span className="font-medium text-sm">Join Code</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[var(--accent-cyan)]">{code}</span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--foreground-muted)]"
          >
            ▼
          </motion.span>
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 flex flex-col items-center gap-3">
              {/* QR Code */}
              <div className="p-3 bg-white rounded-xl">
                <QRCodeSVG
                  value={sessionUrl}
                  size={120}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0d0f12"
                />
              </div>

              {/* Join URL */}
              <div className="text-center">
                <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1">
                  Join at
                </p>
                <p className="text-xs text-[var(--accent-cyan)] font-mono break-all">
                  {sessionUrl.replace('https://', '').replace('http://', '')}
                </p>
              </div>

              {/* Room code display */}
              <div className="flex gap-1 justify-center">
                {code.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="
                      w-8 h-10
                      flex items-center justify-center
                      text-xl font-bold font-mono
                      rounded-md
                      border border-[var(--accent-cyan)]/30
                      text-[var(--accent-cyan)]
                    "
                    style={{
                      background: 'var(--accent-cyan-glow)',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
