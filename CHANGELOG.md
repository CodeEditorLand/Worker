# Changelog - Worker

Worker is our service-worker / web-worker layer for the renderer -
the bundle that handles background processing and shim caching for
Wind/Sky. This file records what we built in our voice, version by
version. Format adapted from
[Keep a Changelog](https://keepachangelog.com/).

## [v2.1] - Full Workbench Lift (April 2026)

We tightened Worker's service-worker registration and brought the
ESBuild config in line with the bundled-electron profile.

### Added

- **Comprehensive README** with architecture diagrams and usage
  guide (`0b20621`, 2026-04-05) and a benefit-focused rewrite pass
  (`1edbd06`, `d778faf`, 2026-04-04).
- **Complete CHANGELOG history** documented from 0.0.1 to 0.5.0
  (`579aebc`, 2026-04-16).
- **Expanded ESBuild config** with source maps for development
  visibility (`e8bdbb8`, 2026-04-26).

### Changed

- **Service-worker registration wrapped in IIFE** with early return
  (`de28f10`, 2026-04-07). Avoids the registration race we hit
  during workbench boot when the SW tried to claim before the
  page's first paint.
- **ESBuild Worker configuration** reformatted for compact output
  (`ac18ddf`, 2026-04-06; `cb7efdd`, `0ed481e`).
- **Build scripts switched to POSIX-compliant `sh` shebang**
  (`34f5d0f`, 2026-04-06).
- **ESBuild config files minified** for production
  (`c9d9dd7`, 2026-04-25), then expanded back with source maps
  (`e8bdbb8`, 2026-04-26).

### Fixed

- **Obsolete precache paths removed** from the service worker
  (`47516e2`, 2026-04-29). The bundled tree had moved; the SW was
  still trying to precache stale paths.
- **HTML tag structure in the README header** corrected
  (`eaa1f68`, 2026-04-06).
- **Service-worker main file reference** corrected in the README
  (`bb0af5d`, 2026-04-16).

## [v2.0] - Editor Launch (Q1 2026)

We hardened the service worker for the workbench-lift cycle - the
refresh loop and the production minification both landed here.

### Fixed

- **Service-worker refresh loop** prevented with version tracking
  (`ddd814b`, 2026-02-20). The SW was claiming and re-claiming on
  every reload; version tracking gave it a stable identity across
  page lifetimes.
- **Workbench fixes** (`383bea0`, `fdc1d49`, 2026-02-13/14) - the
  renderer side learned to talk to the new Worker bundle cleanly
  during the editor-launch boot path.

### Changed

- **Service Worker minified for production** (`4d1f36d`,
  2026-03-11), then **development-readable build artefacts restored
  with source maps** (`338d634`, 2026-03-13). Two profiles, two
  shapes.
- **`.gitignore` added** to exclude build artefacts (`14232fb`,
  2026-03-13).
- **Naming refactor** + **maintenance pass** (`5190190`, `4e30443`,
  2026-02-10).

## [v1.x] - Architecture Buildout (Q3 2025 - Q4 2025)

The crate sat in maintenance through this window. Continuous
Dependabot rolls and routine generated-artefact updates. The
substantive worker buildout had landed in v1.0 (May 2025); v2.0
above was the next major correctness pass.

### Changed (selected)

- **Composite TypeScript build + declaration maps** enabled
  (`faf80de`, 2025-07-04; `f8da037`, 2025-07-03).
- **ESBuild tree-shaking** toggled by development mode
  (`4e33458`, 2025-07-02).
- **ESBuild configuration refactored** alongside worker-artefact
  updates (`076c6b1`, 2025-06-23).

## [v1.0] - Integration Phase (May 2025: Web Worker Implementation)

The pivotal cycle. Worker became a real bundle - first web-worker
implementation, service-worker security and version tracking, the
ESBuild config that everything else builds on.

### Added

- **Initial web-worker implementation for background processing**
  (`f7af13d`, 2025-05-10; refined across `e267bf4`, `1c82873`,
  `7bfe908`, `8d110ee`, `22ae7f9` through 2025-05-29). Multiple
  attempts as we figured out the shape we wanted.
- **Service-worker security and version tracking**
  (`36b0ada`, 2025-05-03).
- **Generated web-worker bundle for extension-host communication**
  (`0e69a1c`, 2025-05-21). The Worker bundle Cocoon's renderer-side
  shim consumes.

### Changed

- **ESBuild configuration consolidated**, exclusion logic unified
  (`483ae7c`, 2025-05-07).
- **Re-licensed to CC0 1.0** (`22a8af6`, 2025-05-22), then **moved
  to Land Public License v1.0** (`b32fdcc`, 2025-05-10).
- **Documentation URLs normalised to lowercase** (`bbff9b0`,
  2025-05-20).
- **Application path normalised**, shim reference updated
  (`fc71fb0`, 2025-05-09).
- **Obsolete shim cache removed** from service-worker logic
  (`d324d41`, 2025-05-31).
- **Variable naming + error handling improved** in the service
  worker (`83bd769`, 2025-05-03).
- **Dynamic CSS loading mechanism simplified** (`ae55909`,
  2025-05-01).

### Fixed

- **Build cleanup** uses configured `outdir` (`f887fb3`,
  2025-05-01).

## [v0.0] - Project Inception (April 2025)

Repository scaffolded across **April 2025** as a 67-commit setup
push (mostly squash + Dependabot). No published worker
implementation yet - the implementation arrived in v1.0 above.
