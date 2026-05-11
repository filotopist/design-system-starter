/**
 * design-system-starter · Atoms (template)
 * Copyright (c) 2026 Ivan Kolle (@filotopist) — https://github.com/filotopist/design-system-starter
 * Licensed under MIT. See LICENSE in repo root.
 *
 * ATOMS — lowest-level building blocks.
 *
 * Color values below are GENERIC STARTER defaults (Tailwind zinc + blue/sky/
 * amber/emerald scales). They are meant to be replaced once you harvest your
 * reference site — use the values that land in design.md.
 *
 * Conventions:
 * - All hover/focus uses 200ms cubic-bezier(0.4,0,0.2,1) — never 150ms.
 * - No transforms on hover for buttons/cards (per design.md forbidden).
 */
'use client';

import { ReactNode, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

/* ============== UTIL ============== */

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ============== BUTTON ============== */

type BtnSize = 'sm' | 'md' | 'lg';
type BtnVariant = 'accent' | 'outline' | 'ghost' | 'danger';

const BTN_SIZE: Record<BtnSize, string> = {
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-11 px-[22px] text-[14px]',
    lg: 'h-12 px-7 text-[15px]',
};

type AccentTone = 'blue' | 'sky' | 'amber' | 'emerald';

// Generic Tailwind palette (blue-400, sky-300, amber-300, emerald-300).
// Replace after harvest.
const ACCENT_RGB: Record<AccentTone, string> = {
    blue:    '96,165,250',   // blue-400 — default
    sky:     '125,211,252',  // sky-300
    amber:   '252,211,77',   // amber-300
    emerald: '110,231,183',  // emerald-300
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: BtnVariant;
    size?: BtnSize;
    accent?: AccentTone;
    loading?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'accent',
    size = 'md',
    accent = 'blue',
    loading = false,
    disabled,
    className,
    children,
    ...rest
}: ButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [hovering, setHovering] = useState(false);
    const rgb = ACCENT_RGB[accent];

    const isDisabled = disabled || loading;

    if (variant === 'accent') {
        const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            const btn = ref.current;
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
            btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
        };

        return (
            <button
                ref={ref}
                {...rest}
                disabled={isDisabled}
                onMouseMove={handleMove}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                className={cn(
                    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-white isolate overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed',
                    BTN_SIZE[size],
                    className,
                )}
                style={{
                    border: `1px solid rgba(${rgb}, 0.20)`,
                    background: hovering
                        ? `radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(${rgb},0.40), rgba(${rgb},0.06) 60%), linear-gradient(180deg,#18181B,#09090B)`
                        : `radial-gradient(180px circle at 50% 50%, rgba(${rgb},0.10), transparent 60%), linear-gradient(180deg,#18181B,#09090B)`,
                    boxShadow: isDisabled
                        ? 'none'
                        : `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(${rgb}, 0.18)`,
                    transition: 'background 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                {loading ? <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/30 border-t-white animate-spin" /> : null}
                {children}
            </button>
        );
    }

    if (variant === 'outline') {
        return (
            <button
                {...rest}
                disabled={isDisabled}
                className={cn(
                    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-white/95 disabled:opacity-40 disabled:cursor-not-allowed',
                    BTN_SIZE[size],
                    className,
                )}
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    transition: 'background 200ms cubic-bezier(0.4,0,0.2,1), border-color 200ms cubic-bezier(0.4,0,0.2,1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
            >
                {children}
            </button>
        );
    }

    if (variant === 'danger') {
        return (
            <button
                {...rest}
                disabled={isDisabled}
                className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-[#FCA5A5] disabled:opacity-40 disabled:cursor-not-allowed',
                    BTN_SIZE[size],
                    className,
                )}
                style={{
                    background: 'rgba(252,165,165,0.06)',
                    border: '1px solid rgba(252,165,165,0.20)',
                    transition: 'background 200ms cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                {children}
            </button>
        );
    }

    // ghost
    return (
        <button
            {...rest}
            disabled={isDisabled}
            className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-normal text-white/85 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200',
                BTN_SIZE[size],
                className,
            )}
        >
            {children}
        </button>
    );
}

/* ============== BADGE ============== */

type BadgeTone = 'neutral' | 'blue' | 'sky' | 'amber' | 'emerald' | 'success' | 'warn' | 'danger';

const BADGE_TEXT: Record<BadgeTone, string> = {
    neutral:  '#D4D4D8',   // zinc-300
    blue:     '#60A5FA',   // blue-400
    sky:      '#7DD3FC',   // sky-300
    amber:    '#FCD34D',   // amber-300
    emerald:  '#6EE7B7',   // emerald-300
    success:  '#86EFAC',   // green-300
    warn:     '#FCD34D',
    danger:   '#FCA5A5',
};

export function Badge({
    tone = 'neutral',
    children,
    className,
}: {
    tone?: BadgeTone;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-[11px] font-medium tracking-[0.04em] uppercase',
                className,
            )}
            style={{
                color: BADGE_TEXT[tone],
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {children}
        </span>
    );
}

/* ============== STATUS INDICATOR ============== */

type StatusKind = 'live' | 'idle' | 'warn' | 'down';

const STATUS_COLOR: Record<StatusKind, string> = {
    live: '#86EFAC',   // green-300
    idle: '#93C5FD',   // blue-300
    warn: '#FCD34D',   // amber-300
    down: '#FCA5A5',   // red-300
};

export function StatusIndicator({
    kind = 'live',
    label,
}: {
    kind?: StatusKind;
    label?: string;
}) {
    const color = STATUS_COLOR[kind];
    return (
        <span className="inline-flex items-center gap-2 text-[12px] text-white/80 font-mono tracking-[0.02em]">
            <span className="relative inline-flex">
                <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                {kind === 'live' && (
                    <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: color, opacity: 0.35 }}
                    />
                )}
            </span>
            {label ?? kind}
        </span>
    );
}

/* ============== TEXT INPUT ============== */

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function TextInput({ label, error, className, id, ...rest }: TextInputProps) {
    const inputId = id || `ti-${Math.random().toString(36).slice(2, 8)}`;
    return (
        <label htmlFor={inputId} className="flex flex-col gap-1.5">
            {label && (
                <span className="text-[12px] text-white/70 font-medium tracking-[0.02em]">{label}</span>
            )}
            <input
                id={inputId}
                {...rest}
                className={cn(
                    'h-11 rounded-lg px-3.5 text-[14px] text-white placeholder-white/35 outline-none',
                    className,
                )}
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${error ? 'rgba(252,165,165,0.45)' : 'rgba(255,255,255,0.10)'}`,
                    transition: 'border-color 200ms cubic-bezier(0.4,0,0.2,1), background 200ms cubic-bezier(0.4,0,0.2,1)',
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = error ? 'rgba(252,165,165,0.6)' : 'rgba(96,165,250,0.45)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? 'rgba(252,165,165,0.45)' : 'rgba(255,255,255,0.10)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
            />
            {error && <span className="text-[11px] text-[#FCA5A5]">{error}</span>}
        </label>
    );
}

/* ============== SWITCH ============== */

export function Switch({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative h-6 w-10 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
            )}
            style={{
                background: checked ? 'rgba(96,165,250,0.30)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${checked ? 'rgba(96,165,250,0.50)' : 'rgba(255,255,255,0.14)'}`,
            }}
        >
            <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200"
                style={{ left: checked ? '20px' : '2px' }}
            />
        </button>
    );
}
