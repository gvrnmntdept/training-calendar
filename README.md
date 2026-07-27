# FORM / BASE Training Calendar

A static React and TypeScript training calendar built with vanilla Vite. It has no server runtime, API routes, Workers, Pages Functions, or framework-specific deployment adapter.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production site is written to `dist/`.

## Deploy to Cloudflare Pages

Connect this repository in Cloudflare Pages and use:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave empty when this repository is the project root

No Wrangler configuration, Worker entrypoint, Pages Function, or environment variable is required.

Cloudflare guide: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/
