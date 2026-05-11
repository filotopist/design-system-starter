/**
 * design-system-starter · Molecules (template)
 * Copyright (c) 2026 Ivan Kolle (@filotopist) — https://github.com/filotopist/design-system-starter
 * Licensed under MIT. See LICENSE in repo root.
 *
 * MOLECULES — small compositions of atoms.
 *
 * SCAFFOLD. Add components as you need them.
 * Rule: if you write the same pattern twice (or it's clearly reusable
 * across surfaces), promote it here from inline code.
 *
 * Suggested first additions:
 * - FormRow      (label + TextInput + error)
 * - ToggleRow    (label + description + Switch)
 * - StatBlock    (label + big number + delta)
 * - SearchBar    (TextInput with leading icon + shortcut hint)
 * - PaginationBar (page numbers + prev/next)
 */
'use client';

import { ReactNode } from 'react';
import { Badge, StatusIndicator } from './Atoms';

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ============== STAT BLOCK ============== */

export function StatBlock({
    label,
    value,
    delta,
    deltaTone = 'neutral',
}: {
    label: string;
    value: ReactNode;
    delta?: string;
    deltaTone?: 'up' | 'down' | 'neutral';
}) {
    const deltaColor =
        deltaTone === 'up' ? '#86EFAC' :
        deltaTone === 'down' ? '#FCA5A5' :
        '#D4D4D8';   // zinc-300

    return (
        <div
            className="flex flex-col gap-2 rounded-xl p-4"
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <span className="text-[11px] uppercase tracking-[0.08em] text-white/55 font-mono">{label}</span>
            <span className="text-[28px] font-medium text-white tracking-tight">{value}</span>
            {delta && (
                <span className="text-[12px] font-mono" style={{ color: deltaColor }}>{delta}</span>
            )}
        </div>
    );
}

/* ============== CARD ============== */

export function Card({
    title,
    subtitle,
    actions,
    children,
    className,
}: {
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn('rounded-xl p-5 flex flex-col gap-4', className)}
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {(title || actions) && (
                <header className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        {title && <h3 className="text-[16px] font-medium text-white tracking-tight">{title}</h3>}
                        {subtitle && <p className="text-[13px] text-white/60">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </header>
            )}
            {children}
        </section>
    );
}

/* ============== LIST ROW ============== */

export function ListRow({
    leading,
    title,
    subtitle,
    trailing,
    onClick,
}: {
    leading?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    trailing?: ReactNode;
    onClick?: () => void;
}) {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg text-left w-full',
                onClick && 'hover:bg-white/[0.03] transition-colors duration-200',
            )}
        >
            {leading && <div className="shrink-0">{leading}</div>}
            <div className="flex-1 min-w-0">
                <div className="text-[14px] text-white truncate">{title}</div>
                {subtitle && <div className="text-[12px] text-white/55 truncate">{subtitle}</div>}
            </div>
            {trailing && <div className="shrink-0">{trailing}</div>}
        </Tag>
    );
}

/* ============== STATUS PILL ============== */

export function StatusPill({
    kind,
    label,
    count,
}: {
    kind: 'live' | 'idle' | 'warn' | 'down';
    label: string;
    count?: number;
}) {
    return (
        <span
            className="inline-flex items-center gap-2 rounded-full px-3 h-7"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <StatusIndicator kind={kind} label={label} />
            {typeof count === 'number' && <Badge tone="neutral">{count}</Badge>}
        </span>
    );
}
