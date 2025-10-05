# ARSA – Autonomous Recognition System for Automatic Disaster Detection

## Project Summary

ARSA focuses on the commercialization of Low Earth Orbit (LEO) through an onboard Large Language Model (LLM) framework that transforms satellites into intelligent, service-oriented platforms. Our system enables **real-time, in-orbit analysis of imagery and sensor data**, removing the need to downlink raw data to Earth and drastically reducing latency. Operators issue high-level analytical requests—such as wildfire detection or river overflow monitoring—and receive actionable insights directly from orbit.

This approach tackles the biggest pain points in remote sensing today: bandwidth constraints, communication delays, and data overload. By processing data where it is captured, ARSA advances the vision of rentable, AI-driven satellites that provide instant intelligence for governments, researchers, and commercial partners.

### Project Demonstration
[Watch the video demo](https://uma365-my.sharepoint.com/:p:/g/personal/candelariosgonzalez_alu_uma_es/EY7_1eaJBqxHr9eIfivmE6kBLkcXMXfzgAgI4pCvXaoFBw?e=ILWadL)

---

## Project Details

### From Raw Data to Instant Insight
Traditional Earth observation workflows require downlinking massive imagery archives to ground stations. Communication windows and bandwidth bottlenecks often delay critical information by hours—or days. ARSA brings intelligence directly to space. With LLMs running **inside rented satellites**, the platform analyzes and interprets sensor feeds in orbit, streaming back only the answers users need.

### The Rise of In-Orbit Computing
The LEO ecosystem is entering an era of rentable satellites and dedicated GPU payloads. Initiatives like Lumen Orbit demonstrate how edge computing in space is becoming not only feasible, but essential. ARSA leverages this shift, delivering analytics where they are captured to offer faster, smarter, and lower-cost services.

### Conversational Satellite Interface
Users engage with ARSA through natural language prompts:
- “Is there an active wildfire in this area?”
- “Are there unauthorized vessels near this fishing zone?”

The onboard LLM interprets the request, analyzes the mission imagery, and returns concise, mission-ready insights. Satellites become conversational partners rather than passive data sources.

### Prototype & User Interface
Our prototype is built with Next.js 15, React, and the Gemini Flash 2.5 API for the demo workflow. While the current build uses static imagery for the Seville wildfire/Guadalquivir overflow scenarios, the architecture is designed to ingest real-time satellite feeds. Operators interact via a mission console that combines map visualization, system events, and command controls optimized for both desktop and mobile.

### Real-World Impact
- **Wildfire detection:** Rapid hotspot identification and alerting.
- **Illegal fishing:** Spot unauthorized vessels and flag suspicious behaviors.
- **Environmental monitoring:** Track oil spills, coastal erosion, and flood events.
- **Agriculture:** Monitor drought, pests, and vegetation health.
- **Emergency response:** Provide instant situational awareness for ground teams.

### Demonstrating Feasibility
Using NASA’s Landsat data as a stand-in, ARSA simulates in-orbit LLM analysis to prove near-real-time insight delivery without moving terabytes of imagery. The architecture is modular, allowing payload providers to integrate custom models tuned for speed, power, or domain-specific accuracy.

### Built to Scale Sustainably
ARSA runs on rented satellites, optimized query queues, and cloud-linked interfaces, minimizing the environmental footprint compared to launching proprietary constellations. Edge processing saves energy, lowers bandwidth demands, and reduces carbon emissions while supporting many concurrent users.

### Expanding the Horizon
In the near term, we aim to expand regional coverage and upgrade our onboard AI models. Long-term goals include deploying a dedicated satellite with a highly optimized LLM payload, extending ARSA into a global platform for intelligent Earth observation.

---

## NASA Data
- Landsat city imagery (NASA/USGS)

NASA Space Apps is funded by NASA's Earth Science Division through a contract with Booz Allen Hamilton, Mindgrub, and SecondMuse.

---

## Development Guide

### Prerequisites
- Node.js 20 (Corepack enabled)
- pnpm (managed by Corepack)
- Google AI Studio API key for Gemini Flash 2.5
- Cloudflare account (Pages + Workers) for deployment

### Environment
```bash
cp .env.local.example .env.local
# Populate .env.local with:
# GEMINI_API_KEY=<your-gemini-api-key>
```

### Install & Run
```bash
corepack pnpm install
corepack pnpm dev
```
- Access the app at `http://localhost:3000`
- Use `--hostname 0.0.0.0 --port <PORT>` with `pnpm dev` (Next.js 15) if you need remote device testing.

### Production Build
```bash
corepack pnpm build
```

### Cloudflare Deployment Scripts
We use `@cloudflare/next-on-pages` plus `wrangler` to adapt Next.js 15 output for Cloudflare Pages.

```bash
export CLOUDFLARE_API_TOKEN="<token>"
export CLOUDFLARE_ACCOUNT_ID="<account-id>"
export GEMINI_API_KEY="<gemini-key>"

# First-time Pages project creation (optional)
npx wrangler pages project create mst-nasa-space-app --production-branch main

# Preview deploy
a) corepack pnpm deploy:cf

# Production deploy (promote build)
b) corepack pnpm deploy:cf -- --branch=main --commit-dirty=true --env=production
```
- The script compiles via `next-on-pages` and uploads static artifacts to `.vercel/output/static`.
- Set `GEMINI_API_KEY` as a Pages secret: `npx wrangler pages secret put GEMINI_API_KEY --project-name=mst-nasa-space-app`
- Production host: **https://mst-nasa-space-app.pages.dev**

### Scripts
- `corepack pnpm dev` – Start the dev server.
- `corepack pnpm build` – Build for production.
- `corepack pnpm deploy:cf` – Preview deploy to Cloudflare Pages.
- `corepack pnpm deploy:cf -- --branch=main --commit-dirty=true --env=production` – Promote to production.

### Security & Repo Hygiene
- Secrets remain outside the repo. All `.env*` files are ignored except the example template.
- `agents.md` is intentionally ignored to keep internal operator notes private.

---

Copyright © 2025 NASA | Privacy Policy | Legal | Contact | Resources

Connect with **#SpaceApps**
