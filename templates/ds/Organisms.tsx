/**
 * design-system-starter · Organisms (template)
 * Copyright (c) 2026 Ivan Kolle (@filotopist) — https://github.com/filotopist/design-system-starter
 * Licensed under MIT. See LICENSE in repo root.
 *
 * ORGANISMS — full page sections built from atoms + molecules.
 *
 * SCAFFOLD. Add as you go.
 *
 * Suggested first additions:
 * - PageHeader   (eyebrow + h1 + subtitle + actions slot)
 * - Sidebar      (logo + nav items + footer block)
 * - TopBar       (workspace switcher + search + user menu)
 * - DataTable    (header + rows + pagination)
 * - EmptyState   (icon + title + subtitle + CTA)
 */
'use client';

import { ReactNode } from 'react';
import { Button } from './Atoms';

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ============== PAGE HEADER ============== */

export function PageHeader({
    eyebrow,
    title,
    subtitle,
    actions,
}: {
    eyebrow?: string;
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <header className="flex items-end justify-between gap-6 pb-8 mb-8 border-b border-white/[0.06]">
            <div className="flex flex-col gap-2 max-w-2xl">
                {eyebrow && (
                    <span className="text-[11px] uppercase tracking-[0.08em] text-white/55 font-mono">
                        {eyebrow}
                    </span>
                )}
                <h1
                    className="text-[44px] leading-[1.05] font-medium text-white"
                    style={{ letterSpacing: '+0.02em' }}
                >
                    {title}
                </h1>
                {subtitle && <p className="text-[15px] text-white/65 mt-1 leading-relaxed">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3 pb-2">{actions}</div>}
        </header>
    );
}

/* ============== EMPTY STATE ============== */

export function EmptyState({
    icon,
    title,
    subtitle,
    cta,
}: {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    cta?: { label: string; onClick: () => void };
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-3">
            {icon && <div className="text-white/30 mb-2">{icon}</div>}
            <h3 className="text-[18px] font-medium text-white">{title}</h3>
            {subtitle && <p className="text-[14px] text-white/55 max-w-md">{subtitle}</p>}
            {cta && (
                <div className="mt-4">
                    <Button variant="accent" onClick={cta.onClick}>{cta.label}</Button>
                </div>
            )}
        </div>
    );
}

/* ============== SECTION (page-level wrapper) ============== */

export function Section({
    title,
    description,
    children,
    className,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('flex flex-col gap-4 py-8', className)}>
            {(title || description) && (
                <div className="flex flex-col gap-1.5">
                    {title && (
                        <h2 className="text-[24px] font-medium text-white tracking-tight">{title}</h2>
                    )}
                    {description && <p className="text-[14px] text-white/60">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}
