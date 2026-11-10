# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A CIDR practice quiz: the user is shown a random IP/prefix and picks the correct network base address out of four choices. It is an npm-workspaces monorepo with one Express API and two separate frontends (React and Vue) that do the same thing. The duplication is on purpose: the project exists for practice.

- `apps/node`: Express 5 API (TypeScript, ESM, run directly with `tsx`, so there is no build step)
- `apps/react`: React 19 + Vite frontend, served under base path `/react/`, dev port 5155
- `apps/vue`: Vue 3 + Vite frontend, served under base path `/vue/`, dev port 5173 (Vite default)
- `packages/shared`: `@cidr-game/shared`, types only (`CidrChoiceQuery`, `CidrChoices`, `CIDR`), exported straight from `src/index.ts` with no build

## Commands

Run from the repo root:

```bash
npm run node            # API dev server with watch (port 3000, or $PORT)
npm run react           # React dev server
npm run vue             # Vue dev server
npm run build:static    # build both frontends into apps/*/dist
npm run build:react / build:vue / preview:react / preview:vue
npm test                # root `vitest run` across all workspaces (this is what CI runs)
npm run test:watch      # per-workspace vitest watch
npm run lint --workspace=apps/react   # ESLint (React only; Vue has no lint config)
```

Run a single test file or test:

```bash
npx vitest run apps/node/src/choice.test.ts
npx vitest run apps/node/src/choice.test.ts -t "test name"
cd apps/react && npx vitest run src/components/BaseIP.test.tsx   # frontends need their own vite config (jsdom)
```

**Known issue:** there is no root vitest config, so root `npm test` runs the React and Vue tests without the `jsdom` environment that `apps/*/vite.config.ts` sets, and they fail with `document is not defined`. Run frontend tests from inside their workspace directory. When this file was written, one React test and one Vue test also failed even when run that way.

## Architecture

**API flow (two calls per question):**
1. `GET /api/new_ip` returns `{ip, suffix}`: a random IPv4 address and a weighted-random prefix (`randomSuffix` in `apps/node/src/ip.ts` favors /16 and /20–/31).
2. The frontend then calls `GET /api/generate?base=<ip>&suffix=<n>`, which returns `{choices: string[], answer: number}`. `cidrChoices` in `apps/node/src/choice.ts` masks the IP down to its network address and adds neighboring subnet blocks as distractors (previous block, next block, then +2, +3…), shuffled. `answer` is the index of the correct choice.
3. Scoring happens only on the client. The server keeps no state.

IP math works on unsigned 32-bit integers (`ipToInt`/`intToIp`, using `>>> 0` to stay unsigned). Keep that convention when touching mask logic.

`apps/node/src/app.ts` exports the Express app without starting it, so tests can use `supertest`. `index.ts` calls `listen`. CORS is a hand-written middleware with an origin allowlist (production domain plus localhost:5155 and localhost:5173). Add new frontend origins there.

**Frontend structure differs between the two apps:**
- React: `App.tsx` owns the score and calls `/api/new_ip`. `components/BaseIP.tsx` fetches `/api/generate` in a `useEffect` and reports results through the `handleCorrect`/`handleIncorrect` callbacks.
- Vue: everything (score, both fetches) lives in `components/CIDRBaseIP.vue`, which uses a `watch` on the current CIDR to trigger `/api/generate`.

**API URL resolution:** both frontends prefix fetches with `import.meta.env.VITE_API_URL ?? ""`. In production, `.env.production` sets it to an absolute URL. In dev it is empty, so `/api` goes through the Vite proxy configured in each `vite.config.ts`. Note that the proxy currently points at a remote host, not `localhost:3000` as the README describes.

## Deployment

- `Dockerfile` builds only the API (`apps/node` + `packages/shared`) and runs it with `tsx` under `node:22-alpine`.
- `k8s/` contains Kustomize manifests (Deployment + ClusterIP Service `cidr-node` on port 3000, health check at `/healthz`). The README covers running it locally on Minikube (`minikube image build -t cidr-game-node:latest .`, `minikube kubectl -- apply -k k8s/`, then port-forward).
- The frontends are static builds meant to be hosted at `/react` and `/vue`.
- CI (`.gitlab-ci.yml`) only runs `npm ci --workspaces` and `npm test` on `node:22`.
