'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

interface SessionCodeProps {
  code: string;
  sessionUrl: string;
}

export default function SessionCode({ code, sessionUrl }: SessionCodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 flex flex-col items-center gap-4"
    >
      {/* QR Code */}
      <div className="p-4 bg-white rounded-xl">
        <QRCodeSVG
          value={sessionUrl}
          size={140}
          level="M"
          bgColor="#ffffff"
          fgColor="#0d0f12"
        />
      </div>

      {/* Join instructions */}
      <div className="text-center">
        <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-1">
          Join at
        </p>
        <p className="text-sm text-[var(--accent-cyan)] font-mono">
          {sessionUrl.replace('https://', '').replace('http://', '')}
        </p>
      </div>

      {/* Room code */}
      <div className="text-center">
        <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
          Or enter code
        </p>
        <div className="flex gap-1 justify-center">
          {code.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="
                w-10 h-12
                flex items-center justify-center
                text-2xl font-bold font-mono
                rounded-lg
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
  );
}
