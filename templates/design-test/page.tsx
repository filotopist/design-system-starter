/**
 * design-system-starter · /design-test sandbox (template)
 * Copyright (c) 2026 Ivan Kolle (@filotopist) — https://github.com/filotopist/design-system-starter
 * Licensed under MIT. See LICENSE in repo root.
 *
 * /design-test — sandbox / visual catalog of the design system.
 *
 * This page exists so:
 *   1. You can eyeball every component in one place.
 *   2. Claude has a witness file to reference before inlining new UI.
 *
 * When you add an Atom/Molecule/Organism — add a swatch here.
 */
'use client';

import { useState } from 'react';
import {
    Button,
    Badge,
    StatusIndicator,
    TextInput,
    Switch,
    StatBlock,
    Card,
    ListRow,
    StatusPill,
    PageHeader,
    EmptyState,
    Section,
} from './ds';

export default function DesignTestPage() {
    const [switchOn, setSwitchOn] = useState(true);
    const [inputVal, setInputVal] = useState('');

    return (
        <main
            className="min-h-screen text-white"
            style={{
                background:
                    'radial-gradient(60% 50% at 20% 0%, rgba(96,165,250,0.04), transparent 70%), radial-gradient(50% 50% at 90% 100%, rgba(255,255,255,0.03), transparent 70%), #09090B',
            }}
        >
            <div className="max-w-6xl mx-auto px-8 py-16">
                <PageHeader
                    eyebrow="DESIGN SYSTEM · v0.1"
                    title="Sandbox"
                    subtitle="Every atom, molecule, organism in one place. Reference this before inlining anything new."
                    actions={
                        <>
                            <Button variant="ghost" size="sm">Docs</Button>
                            <Button variant="accent" size="sm">Add component</Button>
                        </>
                    }
                />

                {/* ============= ATOMS ============= */}
                <Section title="Atoms" description="Lowest-level primitives. Composable, stateless where possible.">

                    {/* Buttons */}
                    <Card title="Buttons" subtitle="Three-tier taxonomy: accent / outline / ghost. Danger as a separate semantic.">
                        <div className="flex flex-wrap gap-3 items-center">
                            <Button variant="accent" accent="blue">Primary</Button>
                            <Button variant="accent" accent="sky">Sky CTA</Button>
                            <Button variant="accent" accent="amber">Amber CTA</Button>
                            <Button variant="accent" accent="emerald">Emerald CTA</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Delete</Button>
                            <Button variant="accent" loading>Saving…</Button>
                            <Button variant="accent" disabled>Disabled</Button>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center pt-3">
                            <Button variant="accent" size="sm">Small</Button>
                            <Button variant="accent" size="md">Medium</Button>
                            <Button variant="accent" size="lg">Large</Button>
                        </div>
                    </Card>

                    {/* Badges */}
                    <Card title="Badges" subtitle="Tone-coded chips. Pastel text on quiet surface, never solid fill.">
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge tone="neutral">Neutral</Badge>
                            <Badge tone="blue">Blue</Badge>
                            <Badge tone="sky">Sky</Badge>
                            <Badge tone="amber">Amber</Badge>
                            <Badge tone="emerald">Emerald</Badge>
                            <Badge tone="success">Success</Badge>
                            <Badge tone="warn">Warn</Badge>
                            <Badge tone="danger">Danger</Badge>
                        </div>
                    </Card>

                    {/* Status */}
                    <Card title="Status indicators" subtitle="Pulse dot + monospace label. Use sparingly — only for live state.">
                        <div className="flex flex-wrap gap-6 items-center">
                            <StatusIndicator kind="live" label="LIVE" />
                            <StatusIndicator kind="idle" label="IDLE" />
                            <StatusIndicator kind="warn" label="DEGRADED" />
                            <StatusIndicator kind="down" label="DOWN" />
                        </div>
                    </Card>

                    {/* Inputs */}
                    <Card title="Text input" subtitle="Default + focus + error state.">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                            <TextInput
                                label="Email"
                                placeholder="you@company.com"
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                            />
                            <TextInput label="Workspace name" placeholder="acme-inc" />
                            <TextInput label="API key" placeholder="sk_live_…" error="Invalid format" />
                        </div>
                    </Card>

                    {/* Switch */}
                    <Card title="Switch" subtitle="Boolean control. Accent tint on active.">
                        <div className="flex items-center gap-3">
                            <Switch checked={switchOn} onChange={setSwitchOn} />
                            <span className="text-[14px] text-white/70">{switchOn ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </Card>

                </Section>

                {/* ============= MOLECULES ============= */}
                <Section title="Molecules" description="Small compositions: stat blocks, list rows, status pills.">

                    <Card title="Stat blocks">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatBlock label="Active users" value="12,483" delta="↑ 4.2% wk" deltaTone="up" />
                            <StatBlock label="Revenue" value="$84.2k" delta="↑ 12% wk" deltaTone="up" />
                            <StatBlock label="Churn" value="2.1%" delta="↓ 0.3 pp" deltaTone="down" />
                            <StatBlock label="Latency p95" value="124ms" />
                        </div>
                    </Card>

                    <Card title="List rows" subtitle="Hoverable, optional leading/trailing slots.">
                        <div className="flex flex-col">
                            <ListRow
                                title="Production database"
                                subtitle="us-east-1 · postgres-15 · 64 GB"
                                trailing={<StatusIndicator kind="live" label="HEALTHY" />}
                                onClick={() => {}}
                            />
                            <ListRow
                                title="Staging cluster"
                                subtitle="eu-west-2 · k8s · 12 nodes"
                                trailing={<StatusIndicator kind="warn" label="DEGRADED" />}
                                onClick={() => {}}
                            />
                            <ListRow
                                title="Image CDN"
                                subtitle="global · cloudfront"
                                trailing={<StatusIndicator kind="idle" label="IDLE" />}
                                onClick={() => {}}
                            />
                        </div>
                    </Card>

                    <Card title="Status pills" subtitle="Use in dashboards / headers for at-a-glance state.">
                        <div className="flex flex-wrap gap-3">
                            <StatusPill kind="live" label="ALL SYSTEMS" count={12} />
                            <StatusPill kind="warn" label="DEGRADED" count={1} />
                            <StatusPill kind="down" label="INCIDENTS" count={0} />
                        </div>
                    </Card>

                </Section>

                {/* ============= ORGANISMS ============= */}
                <Section title="Organisms" description="Full sections.">
                    <Card title="EmptyState">
                        <EmptyState
                            title="No projects yet"
                            subtitle="Create your first project to get started. You can add team members and integrations after."
                            cta={{ label: 'Create project', onClick: () => {} }}
                        />
                    </Card>
                </Section>

                {/* ============= TYPOGRAPHY ============= */}
                <Section title="Typography" description="Display / heading / body / mono.">
                    <Card>
                        <h1
                            className="text-[56px] leading-[1.05] font-medium text-white"
                            style={{ letterSpacing: '+0.02em' }}
                        >
                            Hero / h1 (56px, weight 500)
                        </h1>
                        <h2 className="text-[40px] font-medium text-white tracking-tight">h2 — Section header</h2>
                        <h3 className="text-[28px] font-medium text-white">h3 — Subsection</h3>
                        <p className="text-[15px] text-white/85 leading-relaxed max-w-2xl">
                            Body — 15px, Inter, weight 400, line-height 1.6. Lorem ipsum dolor sit amet, consectetur
                            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <p className="text-[13px] text-white/55">Small — 13px, secondary tone.</p>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-white/55 font-mono">EYEBROW · MONO · UPPERCASE</p>
                    </Card>
                </Section>

            </div>
        </main>
    );
}
