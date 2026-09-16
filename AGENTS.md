<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Dev environment

Push to `dev` branch → Dokploy auto-builds the Dockerfile (app `yrc-preview`) → live preview at https://yrc-dev.kiarash.online in ~1 min. `main` → Vercel production. ImageKit env var (`NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`) is configured in Dokploy, never commit it. Plain `Dockerfile` is ignored by Vercel; never create `Dockerfile.vercel`.
