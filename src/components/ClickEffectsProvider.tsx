import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  shape: 'circle' | 'star' | 'diamond';
}

interface ShockwaveRing {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export type AnimationMode = 'sparkles' | 'shockwave' | 'fireworks' | 'subtle';

export const triggerConfettiBurst = (x = 0.5, y = 0.5) => {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { x, y },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
    });
  } catch (e) {
    console.debug('Confetti error:', e);
  }
};

export const ClickEffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveRing[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fv_sound_fx') === 'true';
  });
  const [animationMode, setAnimationMode] = useState<AnimationMode>(() => {
    return (localStorage.getItem('fv_anim_mode') as AnimationMode) || 'sparkles';
  });
  const [showControls, setShowControls] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClickSound = (pitch = 560) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Soft crisp mechanical pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, now + 0.045);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore audio synthesis errors on autoplay restrictions
    }
  };

  useEffect(() => {
    localStorage.setItem('fv_sound_fx', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('fv_anim_mode', animationMode);
  }, [animationMode]);

  useEffect(() => {
    const vibrantColors = [
      '#2563eb', // Blue
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#e11d48', // Rose
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#f97316', // Orange
    ];

    const shapes: ('circle' | 'star' | 'diamond')[] = ['circle', 'star', 'diamond'];

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      // Find closest clickable element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest('button, [role="button"], a.btn, input[type="button"], input[type="submit"]') as HTMLElement | null;
      if (!button) return;

      // Check if button is disabled
      if (button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true') {
        return;
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      // 1. Tactile spring bounce on button
      button.classList.remove('btn-pop-active');
      // Trigger reflow to restart CSS animation
      void button.offsetWidth;
      button.classList.add('btn-pop-active');
      setTimeout(() => {
        button.classList.remove('btn-pop-active');
      }, 350);

      // 2. In-button Ripple Wave
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple-wave';
      const diameter = Math.max(rect.width, rect.height) * 1.5;
      const radius = diameter / 2;
      const x = clientX - rect.left - radius;
      const y = clientY - rect.top - radius;

      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Check button style to color ripple
      const computed = window.getComputedStyle(button);
      const isDark = computed.backgroundColor.includes('rgb(15, 23, 42)') || 
                     computed.backgroundColor.includes('rgb(30, 41, 59)') ||
                     computed.backgroundColor.includes('rgb(244, 63, 94)') ||
                     computed.backgroundColor.includes('rgb(37, 99, 235)');
      
      ripple.style.background = isDark 
        ? 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)'
        : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)';

      button.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 650);

      // 3. Audio feedback
      playClickSound(Math.random() > 0.5 ? 580 : 640);

      // 4. Mode-specific floating effects
      if (animationMode === 'sparkles' || animationMode === 'fireworks') {
        const particleCount = animationMode === 'fireworks' ? 14 : 7;
        const newParticles: ClickParticle[] = [];

        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.4 - 0.2);
          const speed = Math.random() * 60 + 40;
          const size = Math.floor(Math.random() * 6) + 5;
          const color = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];

          newParticles.push({
            id: Date.now() + Math.random(),
            x: clientX,
            y: clientY,
            angle,
            speed,
            size,
            color,
            shape,
          });
        }

        setParticles((prev) => [...prev.slice(-30), ...newParticles]);
      }

      if (animationMode === 'shockwave' || animationMode === 'sparkles' || animationMode === 'fireworks') {
        const shockwaveId = Date.now() + Math.random();
        const shockwaveColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];

        setShockwaves((prev) => [
          ...prev.slice(-8),
          {
            id: shockwaveId,
            x: clientX,
            y: clientY,
            color: shockwaveColor,
            size: Math.max(rect.width, rect.height) * 0.85,
          },
        ]);

        setTimeout(() => {
          setShockwaves((prev) => prev.filter((s) => s.id !== shockwaveId));
        }, 500);
      }

      // If fireworks mode and major button, trigger mini canvas confetti
      if (animationMode === 'fireworks') {
        const isPrimary = button.classList.contains('bg-rose-600') ||
                          button.classList.contains('bg-blue-600') ||
                          button.classList.contains('bg-emerald-600') ||
                          button.textContent?.includes('Save') ||
                          button.textContent?.includes('Export') ||
                          button.textContent?.includes('New Visit');
        if (isPrimary) {
          triggerConfettiBurst(clientX / window.innerWidth, clientY / window.innerHeight);
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [soundEnabled, animationMode]);

  // Clean up particles after they animate
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles([]);
    }, 600);
    return () => clearTimeout(timer);
  }, [particles]);

  return (
    <>
      {children}

      {/* Floating Particle / Click Effects Layer */}
      <div
        id="click-effects-overlay"
        className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Shockwave Rings */}
        {shockwaves.map((sw) => (
          <span
            key={sw.id}
            className="absolute rounded-full pointer-events-none animate-click-shockwave"
            style={{
              left: `${sw.x}px`,
              top: `${sw.y}px`,
              borderColor: sw.color,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 16px ${sw.color}66`,
            }}
          />
        ))}

        {/* Floating Flying Sparkles */}
        {particles.map((p) => {
          const destX = Math.cos(p.angle) * p.speed;
          const destY = Math.sin(p.angle) * p.speed;

          return (
            <span
              key={p.id}
              className="absolute pointer-events-none animate-sparkle-burst"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '30%',
                transform: `translate(-50%, -50%) rotate(${p.angle * 50}deg)`,
                boxShadow: `0 0 8px ${p.color}`,
                ['--dest-x' as string]: `${destX}px`,
                ['--dest-y' as string]: `${destY}px`,
              }}
            />
          );
        })}
      </div>

      {/* Floating Animation Control Widget (bottom right floating pill) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden">
        {showControls && (
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xl w-64 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Click Animation FX</span>
              </div>
              <button
                type="button"
                onClick={() => setShowControls(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-md hover:bg-slate-100 font-medium"
              >
                Close
              </button>
            </div>

            {/* Mode selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Click Visual Style
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAnimationMode('sparkles')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all font-medium ${
                    animationMode === 'sparkles'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ✨ Sparkles
                </button>
                <button
                  type="button"
                  onClick={() => setAnimationMode('shockwave')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all font-medium ${
                    animationMode === 'shockwave'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  💫 Shockwave
                </button>
                <button
                  type="button"
                  onClick={() => setAnimationMode('fireworks')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all font-medium ${
                    animationMode === 'fireworks'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🎆 Fireworks
                </button>
                <button
                  type="button"
                  onClick={() => setAnimationMode('subtle')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all font-medium ${
                    animationMode === 'subtle'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🌊 Wave Only
                </button>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                Tactile Audio Tick
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) playClickSound(600);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Small floating trigger button */}
        <button
          type="button"
          onClick={() => setShowControls((prev) => !prev)}
          className="group inline-flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/80 rounded-full shadow-md hover:shadow-lg transition-all text-xs font-semibold backdrop-blur-md"
          title="Customize Button Click Animations & Sound"
        >
          <Flame className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="hidden sm:inline">Click FX</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      </div>
    </>
  );
};
