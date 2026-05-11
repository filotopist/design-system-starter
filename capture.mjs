/**
 * design-system-starter · capture.mjs
 * Copyright (c) 2026 Ivan Kolle (@filotopist) — https://github.com/filotopist/design-system-starter
 * Licensed under MIT. See LICENSE in repo root.
 *
 * Harvest design tokens from any public website.
 *
 * v0.2 — sectional + per-element screenshots so a multimodal LLM (Claude
 * Code's Read tool) can ingest small focused images rather than a single
 * full-page PNG. Vision-first: the JSON files are accompaniment for the
 * screenshots, not the other way around.
 *
 * Opens the target URL in headless Chromium via Playwright and dumps:
 *   - full-page + above-the-fold + mobile screenshots
 *   - sectional crops (hero / nav / cards-row / footer)
 *   - per-named-button screenshots at rest AND on hover, plus computed styles
 *   - per-card screenshots (top 3 cards by area) with computed styles
 *   - per-h1/h2 screenshots with their typography metadata
 *   - inventory of every interactive element with computed styles
 *   - network requests (Rive / Framer Motion / GSAP / Lottie / Spline)
 *   - tier-hints.json — quick site classification signals
 *
 * Output lands in /tmp/<sitename>-extract/. Throw away after Claude synthesizes
 * into design.md.
 *
 * Usage:
 *   TARGET=https://example.com/ node capture.mjs
 *   TARGET=https://example.com/ OUT=/tmp/example-extract node capture.mjs
 *   TARGET=... BUTTONS="Sign up,Get demo,Pricing" node capture.mjs
 *
 * Requires:
 *   npm install
 *   npx playwright install chromium
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET = process.env.TARGET;
if (!TARGET) {
    console.error('Usage: TARGET=https://example.com/ node capture.mjs');
    process.exit(1);
}

const sitename = TARGET.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
const OUT = process.env.OUT || `/tmp/${sitename}-extract`;
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT_W = parseInt(process.env.VIEWPORT_W || '1440', 10);
const log = (...a) => console.log('[capture]', ...a);

const NAMED_BUTTONS = (process.env.BUTTONS || 'Get started,Try it now,Sign up,Log in,Start free,Get demo,Explore,Learn more,Subscribe,Contact')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

(async () => {
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
        viewport: { width: VIEWPORT_W, height: 900 },
        deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();

    const requests = [];
    page.on('request', (req) => {
        const url = req.url();
        if (
            /\.(js|css|riv|wasm|woff2)(\?|$)/.test(url) ||
            /(framer|motion|gsap|lottie|rive|lenis|three|spline|emotion|styled)/.test(url)
        ) {
            requests.push(url);
        }
    });

    log('navigating', TARGET);
    await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    // -------------- 01-02: full + fold
    log('full + fold screenshots');
    await page.screenshot({ path: path.join(OUT, '01-full-desktop.png'), fullPage: true });
    await page.screenshot({ path: path.join(OUT, '02-fold-desktop.png'), fullPage: false });

    // -------------- 02a: nav strip
    try {
        const nav = page.locator('header, nav, [role="banner"]').first();
        if ((await nav.count()) > 0) {
            await nav.screenshot({ path: path.join(OUT, '02a-nav.png') });
            log('captured nav strip');
        }
    } catch (e) {
        log('nav skip:', e.message.slice(0, 80));
    }

    // -------------- 02b: hero (first big section in viewport)
    try {
        const heroBox = await page.evaluate(() => {
            const main = document.querySelector('main, [role="main"], section') || document.body;
            const firstSection = main.querySelector('section, .hero, [class*="hero" i]') || main.firstElementChild;
            if (!firstSection) return null;
            const r = firstSection.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: Math.min(r.height, 900) };
        });
        if (heroBox && heroBox.w > 100 && heroBox.h > 100) {
            await page.screenshot({
                path: path.join(OUT, '02b-hero.png'),
                clip: { x: Math.max(0, heroBox.x), y: Math.max(0, heroBox.y), width: heroBox.w, height: heroBox.h },
            });
            log('captured hero section');
        }
    } catch (e) {
        log('hero skip:', e.message.slice(0, 80));
    }

    // -------------- inventory of all interactive elements
    const inventory = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('a, button, [role="button"]'));
        return all
            .filter((el) => {
                const t = (el.textContent || '').trim();
                return t.length > 0 && t.length < 30 && el.offsetWidth > 50 && el.offsetHeight > 18;
            })
            .slice(0, 40)
            .map((el) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                    text: el.textContent.trim().slice(0, 50),
                    tag: el.tagName.toLowerCase(),
                    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
                    styles: Object.fromEntries(
                        [
                            'background',
                            'backgroundImage',
                            'backgroundColor',
                            'color',
                            'border',
                            'borderRadius',
                            'boxShadow',
                            'fontFamily',
                            'fontSize',
                            'fontWeight',
                            'letterSpacing',
                            'padding',
                            'height',
                            'transition',
                            'transform',
                            'opacity',
                            'backdropFilter',
                        ].map((k) => [k, cs[k]]),
                    ),
                };
            });
    });
    fs.writeFileSync(path.join(OUT, 'buttons-inventory.json'), JSON.stringify(inventory, null, 2));
    log(`logged ${inventory.length} interactive elements`);

    // -------------- per-named-button capture (rest + hover)
    for (const text of NAMED_BUTTONS) {
        try {
            const loc = page.locator(`*:text("${text}")`).first();
            if ((await loc.count()) === 0) continue;
            await loc.scrollIntoViewIfNeeded();
            await page.waitForTimeout(300);
            const safe = text.toLowerCase().replace(/\s+/g, '-');

            await loc.screenshot({ path: path.join(OUT, `btn-${safe}-rest.png`) });
            const restStyles = await loc.evaluate((el) => {
                const cs = getComputedStyle(el);
                return Object.fromEntries(
                    [
                        'background',
                        'backgroundImage',
                        'backgroundColor',
                        'color',
                        'border',
                        'borderRadius',
                        'boxShadow',
                        'transition',
                        'transform',
                        'fontFamily',
                        'fontSize',
                        'fontWeight',
                        'letterSpacing',
                        'padding',
                        'height',
                        'width',
                    ].map((k) => [k, cs[k]]),
                );
            });

            await loc.hover({ force: true });
            await page.waitForTimeout(500);
            await loc.screenshot({ path: path.join(OUT, `btn-${safe}-hover.png`) });
            const hoverStyles = await loc.evaluate((el) => {
                const cs = getComputedStyle(el);
                return Object.fromEntries(
                    ['background', 'backgroundImage', 'boxShadow', 'transform', 'opacity', 'border', 'color'].map((k) => [
                        k,
                        cs[k],
                    ]),
                );
            });

            fs.writeFileSync(
                path.join(OUT, `btn-${safe}.json`),
                JSON.stringify({ rest: restStyles, hover: hoverStyles }, null, 2),
            );
            log(`captured "${text}"`);
            await page.mouse.move(0, 0);
        } catch (e) {
            log(`skip ${text}: ${e.message.slice(0, 100)}`);
        }
    }

    // -------------- per-h1/h2 with typography
    const headings = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('h1, h2, h3, [class*="display"], [class*="heading"]'));
        return all
            .filter((el) => {
                const cs = getComputedStyle(el);
                return parseFloat(cs.fontSize) > 28;
            })
            .slice(0, 6)
            .map((el, i) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                    idx: i,
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent.trim().slice(0, 80),
                    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
                    fontFamily: cs.fontFamily,
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight,
                    letterSpacing: cs.letterSpacing,
                    lineHeight: cs.lineHeight,
                    color: cs.color,
                    backgroundImage: cs.backgroundImage,
                    webkitTextFillColor: cs.webkitTextFillColor,
                    textTransform: cs.textTransform,
                };
            });
    });
    fs.writeFileSync(path.join(OUT, 'big-text-styles.json'), JSON.stringify(headings, null, 2));

    for (const h of headings.slice(0, 4)) {
        try {
            const loc = page.locator(h.tag).nth(h.idx);
            if ((await loc.count()) === 0) continue;
            await loc.scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
            await loc.screenshot({ path: path.join(OUT, `heading-${h.tag}-${h.idx}.png`) });
        } catch (e) {
            log(`heading skip ${h.tag}#${h.idx}: ${e.message.slice(0, 60)}`);
        }
    }
    log(`captured ${headings.length} headings (>28px)`);

    // -------------- card inventory + per-card screenshots (top 3)
    const cards = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('div, article, section, a'));
        const scored = all
            .filter((el) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                const radius = parseFloat(cs.borderRadius) || 0;
                return (
                    r.width > 200 &&
                    r.width < 800 &&
                    r.height > 150 &&
                    r.height < 700 &&
                    radius >= 8 &&
                    (cs.backgroundImage !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)')
                );
            })
            .slice(0, 12)
            .map((el, i) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                el.setAttribute('data-dss-card-idx', String(i));
                return {
                    idx: i,
                    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
                    text: (el.textContent || '').trim().slice(0, 60),
                    bgImage: cs.backgroundImage,
                    bgColor: cs.backgroundColor,
                    border: cs.border,
                    radius: cs.borderRadius,
                    boxShadow: cs.boxShadow,
                    backdropFilter: cs.backdropFilter,
                    transition: cs.transition,
                };
            });
        return scored;
    });
    fs.writeFileSync(path.join(OUT, 'cards-inventory.json'), JSON.stringify(cards, null, 2));

    for (const c of cards.slice(0, 3)) {
        try {
            const loc = page.locator(`[data-dss-card-idx="${c.idx}"]`).first();
            if ((await loc.count()) === 0) continue;
            await loc.scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
            await loc.screenshot({ path: path.join(OUT, `card-${c.idx}.png`) });
        } catch (e) {
            log(`card skip #${c.idx}: ${e.message.slice(0, 60)}`);
        }
    }
    log(`captured ${Math.min(cards.length, 3)} cards`);

    // -------------- tier hints (cheap signals — Claude decides the final verdict)
    const tierHints = await page.evaluate(() => {
        const html = document.documentElement.outerHTML;
        const allEls = document.querySelectorAll('*');
        const classNames = new Set();
        for (const el of allEls) {
            if (el.className && typeof el.className === 'string') {
                for (const c of el.className.split(/\s+/)) {
                    if (c) classNames.add(c);
                }
            }
        }
        const classList = Array.from(classNames);

        // signals
        const tailwindLike = classList.filter((c) =>
            /^(bg|text|border|p[xytrbl]?|m[xytrbl]?|w|h|flex|grid|gap|rounded|shadow|hover:|focus:|sm:|md:|lg:|xl:)-?/.test(c),
        ).length;
        const hashedLike = classList.filter((c) => /^[a-z]{1,3}[A-Z][a-zA-Z0-9_-]*-[a-z0-9]{4,}$|^css-[a-z0-9]{5,}$/.test(c)).length;
        const semantic = classList.filter((c) =>
            /^(btn|button|card|nav|hero|header|footer|container|section|wrapper|content|primary|secondary|cta)/i.test(c),
        ).length;
        const customProps = (html.match(/--[a-z][a-z0-9-]+:/gi) || []).length;
        const canvasCount = document.querySelectorAll('canvas').length;
        const canvasArea = Array.from(document.querySelectorAll('canvas')).reduce((acc, c) => {
            const r = c.getBoundingClientRect();
            return acc + r.width * r.height;
        }, 0);
        const viewportArea = window.innerWidth * window.innerHeight;

        return {
            total_classes: classList.length,
            tailwind_like_classes: tailwindLike,
            hashed_classes: hashedLike,
            semantic_classes: semantic,
            custom_props_in_html: customProps,
            canvas_count: canvasCount,
            canvas_area_ratio: viewportArea > 0 ? canvasArea / viewportArea : 0,
            sample_classes: classList.slice(0, 30),
        };
    });
    fs.writeFileSync(path.join(OUT, 'tier-hints.json'), JSON.stringify(tierHints, null, 2));
    log('tier hints written');

    // -------------- 03: mobile
    log('mobile screenshot');
    await ctx.close();
    const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    const mp = await mobile.newPage();
    await mp.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 });
    await mp.waitForTimeout(1000);
    await mp.screenshot({ path: path.join(OUT, '03-full-mobile.png'), fullPage: false });
    await mobile.close();

    // -------------- network requests log
    fs.writeFileSync(path.join(OUT, 'network-requests.txt'), [...new Set(requests)].sort().join('\n'));

    await browser.close();
    log('done');
    log('output dir:', OUT);
    log('next: Claude reads tier-hints.json + screenshots, classifies site, synthesizes design.md');
})();
