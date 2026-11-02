# React TfL migration completion

Draft preparation on `wip/react-tfl-completion-20261101`. No live change has been made by this work.
The earlier `wip/cloudflare` commit `087ac52b5905d028918805d304244881cc43d4cc` and main
`aac90c354af72ad853ef8bcca85af320898fc970` are preserved. Finish the checked local gates and
independent review before handing over the owner command.

The intended host is **react.tflchecker.ezeikel.dev**. This comes from the actual Vercel project
domain list, the 24 October migration record, and the original Wrangler comments. It is not a
new name inferred from the repository. The canonical Notion Projects list does not have a
separate React TfL record; the old TfL Alexa note describes a different service.

Fresh read-only inspection on 1 November found an active `ezeikel.dev` Cloudflare zone, all
16 DNS records without this host or a covering wildcard, and no matching Worker custom
domain in the complete 77-domain response. The existing workers.dev site serves the SPA
index, both route paths, unknown-path fallback, JavaScript, CSS and favicon with HTTP200/HSTS.
These are static checks, not functional provider acceptance. The current Google script key is
nonempty and the bundle contains the TfL origin; neither proves provider permissions.

The app is a Vite React SPA, with no database, server actions, cron or backend Worker. The home
page fetches TfL line status in the browser. Journey planning uses Google Places, TfL journey
results and a Google map. A browser check must mock these requests before JavaScript runs;
an ordinary HTML200 contains only the SPA root and cannot prove the app is working.

## Validation

The new pre-push gate uses invented public inputs, the actual Vite build and the actual app.
It runs TypeScript, Worker/artifact controls, pure Python cutover guards and a hydrated browser
smoke. All external traffic is intercepted. The smoke checks rendered status, Places choices,
coordinates in the URL, explicit journey search, journey details, route-to-map adapter and a
hard-refresh deep link. It does not claim real Google/TfL or visual-map acceptance.

The previous source had no test/type/lint scripts, one unconfigured Jest-style utility test,
and disabled pre-commit lint. Do not claim those old checks passed. New normal gates and any
observed inherited source failures must be resolved without suppressing assertions or timeouts.
The dependency lockfile must be refreshed and frozen installation verified before publication.

`scripts/cloudflare/artifact.mjs` records every output file and the exact clean source/tree.
Production inputs must be explicit, complete and use the real TfL origin. Bun PM was observed
inspecting an existing ignored `.env.local` even with `--no-env-file`; this is retained as a
diagnostic, not a source of production values. The owner build therefore runs in a private clean
clone of the exact committed source, without any copied ignored dotenv files. The Vite build
also uses an observed private empty `envDir` and a separately constructed process environment.
Synthetic production values and unresolved placeholders are refused. A manifest rejects
changed/missing/extra/symlinked files. The owner helper retains a private immutable copy before
normal Git hooks can create a later synthetic build. Verification compares complete response
bytes for every asset and SPA path, rather than accepting headers alone.

Optional Cloudflare analytics stays disabled, exactly as the staged Worker/configuration had it.
No new tracking/site is introduced and an absent optional beacon does not block this move.

## Owner-only execution

After independent review, normal local gates and the completed branch push, the final command
must pin the **full reviewed SHA**. The exact existing Fontawesome field reference must first be
identified from its shared vault item; do not invent a field or copy that credential into the app.

```sh
bash docs/cloudflare/cutover.sh --execute FULL_REVIEWED_SHA --fontawesome-ref 'EXACT_EXISTING_OP_REFERENCE'
```

This is a command template, not a ready handoff. The parent migration record will contain the
concrete SHA/reference once checked. Running the pinned command is the owner's authorization;
there is no additional cutover approval phrase. Run in a real Terminal for 1Password and the
functional attestation. The helper refuses agent/pipe execution. Do not execute it while
the source/lockfile/browser checks are still draft.

The helper:

1. Locks this app's local attempt, pins a clean/pushed WIP and unchanged remote main, checks the
   exact account/zone/project/Worker, and saves full before-images. Existing host/wildcard/domain
   collisions refuse execution. All 16 existing DNS records remain untouched.
2. Recovers only the four readable **production** Vercel `VITE_*` values. It saves/read-verifies
   the canonical `TFL Checker Web Prod` item, preserving unrelated fields and sections. Shared
   Cloudflare and Fontawesome credentials stay in their existing items. Values never reach argv,
   terminal output or a committed file. `.env.production.op` contains references only.
3. Sets/read-verifies GitHub public inputs, uploads the two shared GitHub secret values by stdin,
   and keeps the deploy gate false. The four public build values are intentionally browser-bound;
   the registry and Cloudflare credentials are not Worker runtime bindings.
4. Runs the exact-source production build, normal checks and fully mocked browser checks. It
   retains an immutable private artifact and uploads a staging configuration with **no routes**.
   It checks complete workers.dev responses against that copy before any hostname change.
5. Rechecks source and all DNS at the write boundary, attaches only the recorded host, and verifies
   every preexisting DNS record plus workers.dev. DoH and normal resolver checks must both match
   the immutable artifact. Cached NXDOMAIN can delay normal resolution. Both the staging
   workers.dev upload and each
   custom-host resolver check allow at most five minutes of GET-only DNS/connect/TLS/edge
   readiness polling. Every transient path/status/transport result is retained. Exact version and
   domain ownership are rechecked each time; established wrong bytes/headers or ownership drift
   stop immediately. Expiry stops for inspection without skipping a check. No upload, attachment
   or other mutation is retried by this wait.
6. Waits for the owner to use the new host and attest actual line status, journey selection and map
   behavior. This manual attestation is recorded honestly, separately from the mocked checks.
7. Normally fast-forwards main, synchronizes its existing clean local ref without reset/stash,
   enables the checked production workflow and dispatches it once. It waits for the exact new
   source/run and successful Deploy step. The explicit production Wrangler environment retains
   this one custom domain in future ordinary deploys; default staging remains unrouted.
8. Repeats exact public/DNS checks and only then pauses Vercel. It never deletes the old project,
   disables workers.dev, changes mail/DNS records elsewhere, rotates a key or touches any database.

The old Vercel preview failed because project Node20 is discontinued. That is not evidence of a
Cloudflare build regression, and this move does not change Vercel settings merely to repair an
obsolete preview. Its legacy production-branch setting is `master` while GitHub's default is
`main`; the helper pins the actual Git source and project identities rather than treating those
labels as deployment proof.

## Failure and backout

Private metadata and the retained artifact live under `~/.cutover/react-tfl-*`, mode0700. Shared
registry/Cloudflare secrets are never written there; public `VITE_*` values are intentionally
compiled into the browser artifact. On failure the helper stops: it never retries mutations or
rolls back automatically. Inspect the last completed step before choosing a recovery. A fresh
`--execute` refuses an already attached host; do not rerun completed stages blindly.

An explicit owner backout is available from the original unchanged reviewed source:

```sh
bash docs/cloudflare/cutover.sh --rollback ~/.cutover/react-tfl-ATTEMPT/receipt.private.json
```

It requires a real Terminal, the explicit rollback command, the exact created-domain ID/current
host ownership, unchanged before-images and no active deploy. It turns off automatic deployment,
detaches only that exact newly created domain, verifies other DNS and workers.dev, and unpauses
the old Vercel project if needed. It does not revert Git main or delete an unrecorded DNS object.
The original custom hostname had no DNS, so backout restores that **absent hostname**, with the
old Vercel default URLs retained. Do not describe it as restoring a previously working custom host.

After acceptance, observe real use/errors and reconcile generated Vercel URLs/shared links before
any separate owner retirement. Keep workers.dev available. There is no Neon project to retire for
this static app, and the six unrelated dead-project deletion decisions do not apply here.
