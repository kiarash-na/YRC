# Tests

Both suites run without a database, without model tokens and without uploading
anything. Run them before merging to `main`.

```bash
pnpm test        # unit (Vitest), < 1 s
pnpm test:e2e    # end-to-end (Playwright), builds the app first (~1–3 min)
E2E_SKIP_BUILD=1 pnpm test:e2e   # reuse the existing .next build
```

## Unit — `tests/`

- `agent-loop.test.ts`: the Agent's tool loop (`src/lib/agent/loop.ts`) on a
  play-back mock model. It covers:
  - read tools run straight away; mutating tools pause;
  - approve, decline and partial approval;
  - tool errors, unknown or invalid tool calls, the step limit, model failures
    and resume rules.
- `agent-models.test.ts`: the model allowlist (Claude Haiku, Gemini Flash and
  DeepSeek via the AI Gateway) and the scripted e2e model.

## End to end — `e2e/`

`playwright.config.ts` starts `next start` on port 3100 with **test mode** on
(`YRC_E2E=1` + `YRC_E2E_SECRET`; see `src/lib/e2e.ts`):

- **Admin access:** a browser carrying the cookie `yrc-e2e=<secret>` is let in
  as a fixed test admin. Without the cookie, `/admin` still redirects to login
  (tested).
- **Agent:** runs on a scripted mock model
  (`src/lib/agent/e2e-fixtures.ts`) with in-memory `list_events` /
  `create_event` tools. Nothing reaches the database or the AI Gateway. The
  config also blanks `VERCEL_AI_GATEWAY` for the server.
- **ImageKit:** the server signs with dummy keys and the browser's upload
  request is intercepted, so nothing is uploaded.

| Spec | Covers |
|---|---|
| `agent.spec.ts` | read tool without confirmation, confirm, cancel, approve one of two, model picker reaches the server and is remembered, model error recovery, New chat, image upload into the message, admin guard without the cookie |
| `media-upload.spec.ts` | event cover upload (signed fields sent, private key never sent, path and preview filled), non-image rejected, ImageKit error, typing a path by hand |

### Scripted model

The mock model's reply depends on the latest message. To test a new Agent
behaviour, add a rule in `respond()` in `src/lib/agent/e2e-fixtures.ts`.

| Message contains | Mock does |
|---|---|
| `upcoming` / `list events` | calls `list_events` |
| `event called "X"` | calls `create_event` (needs confirmation) |
| `two changes` | two `create_event` calls in one step |
| `which model` | replies `Running on <model id>.` |
| `crash` | the model call throws |

### Safety

Test mode is off unless `YRC_E2E=1` **and** a ≥ 24-character
`YRC_E2E_SECRET` are set on the server. It is also always off on the
production site (Vercel production or yasrise.run), whatever is set. Never set
these variables on Vercel or Dokploy.
