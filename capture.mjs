/**
 * design-system-starter · capture.mjs
 * Copyright (c) 2026 Ivan Kolle (@filotopist) — https://github.com/filotopist/design-system-starter
 * Licensed under MIT. See LICENSE in repo root.
 *
 * Harvest design tokens from any public website.
 *
 * Opens the target URL in headless Chromium via Playwright and dumps:
 *   - full-page + above-the-fold screenshots (desktop @2x + mobile)
 *   - computed styles at rest AND on hover for named buttons
 *   - inventory of every interactive element with applied styles
 *   - every heading >40px with font + gradient-text info
 *   - card-shaped elements with their treatments
 *   - network requests (to detect Rive / Framer Motion / GSAP / Lottie runtimes)
 *
 * Output goes to /tmp/<sitename>-extract/ — meant to be read by an agent
 * (or human) then translated into a design.md. Throw away the dir after.
 *
 * Usage:
 *   TARGET=https://example.com/ node capture.mjs
 *   TARGET=https://example.com/ OUT=/tmp/example-extract node capture.mjs
 *   TARGET=... BUTTONS="Sign up,Get demo,Pricing" node capture.mjs
 *
 * Requires:
 *   npm install   (installs playwright)
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

const NAMED_BUTTONS = (process.env.BUTTONS || 'Get started,Try it now,Sign up,Log in,Start free,Get demo,Explore,Learn more')
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
            /(framer|motion|gsap|lottie|rive|lenis|three|spline)/.test(url)
        ) {
            requests.push(url);
        }
    });

    log('navigating', TARGET);
    await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    log('full + fold screenshots');
    await page.screenshot({ path: path.join(OUT, '01-full-desktop.png'), fullPage: true });
    await page.screenshot({ path: path.join(OUT, '02-fold-desktop.png'), fullPage: false });

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
                    ['background', 'backgroundImage', 'boxShadow', 'transform', 'opacity', 'border'].map((k) => [
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

    // -------------- big text harvest (>40px)
    const bigText = await page.evaluate(() => {
        const all = Array.from(
            document.querySelectorAll('h1, h2, h3, [class*="display"], [class*="heading"]'),
        );
        return all
            .filter((el) => {
                const cs = getComputedStyle(el);
                return parseFloat(cs.fontSize) > 40;
            })
            .slice(0, 8)
            .map((el) => {
                const cs = getComputedStyle(el);
                return {
                    text: el.textContent.trim().slice(0, 80),
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
    fs.writeFileSync(path.join(OUT, 'big-text-styles.json'), JSON.stringify(bigText, null, 2));

    // -------------- card candidate inventory
    const cards = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('div, article, section, a'));
        return all
            .filter((el) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                const radius = parseFloat(cs.borderRadius) || 0;
                return (
                    r.width > 200 &&
                    r.width < 800 &&
                    r.height > 150 &&
                    r.height < 700 &&
                    radius >= 10 &&
                    (cs.backgroundImage !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)')
                );
            })
            .slice(0, 12)
            .map((el) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                    rect: { w: r.width, h: r.height },
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
    });
    fs.writeFileSync(path.join(OUT, 'cards-inventory.json'), JSON.stringify(cards, null, 2));

    // -------------- mobile screenshot
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
    await mp.screenshot({ path: path.join(OUT, '03-full-mobile.png'), fullPage: true });
    await mobile.close();

    // -------------- log requests
    fs.writeFileSync(path.join(OUT, 'network-requests.txt'), [...new Set(requests)].sort().join('\n'));

    await browser.close();
    log('done');
    log('output dir:', OUT);
    log('next: read SKILL.md step 3 — inspect outputs and synthesize into design.md');
})();
