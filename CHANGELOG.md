# Changelog

All notable changes to Worker (Service Worker) are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/).

## [v2.1] — Q2 2026: Full Workbench Lift

### Changed

- ESBuild config indentation reformatted (94 lines)
- IIFE wrap with early return pattern (-752 lines Target/)
- ESBuild structure simplified (+703 lines output)
- README expanded (+196 lines architecture diagrams)

## [v2.0] — Q1 2026: Editor Launch Sprint

### Added

- Version tracking mechanism to prevent infinite refresh loops in
  `Source/Worker/Register.ts` (104 lines refactored)
- `Configuration/ESBuild/Target.js`, `Configuration/ESBuild/Worker.js` (55
  lines each)
- README comprehensive rewrite (182 lines)

### Changed

- Minification toggle: source maps removed (March 11), restored (March 13)

## [v1.3] — Q4 2025: Dependency Maintenance

### Changed

- @types/serviceworker: 0.0.154 → 0.0.162
- Bulk file permission reset (32 files)

## [v1.2] — Q3 2025: Full Stack Integration

### Changed

- @types/serviceworker: 0.0.148 → 0.0.154
- Build infrastructure stable

## [v1.1] — Q2 2025: Architecture Buildout

### Added

- `Source/Worker.ts` — main Service Worker registration entry point
- `Source/Worker/Register.ts` — client-side registration with IIFE pattern
- `Source/Worker/CSS/Load.ts` — dynamic CSS-to-JS transpilation interceptor
- `Source/Worker/Policy.ts` — Content Security Policy enforcement
- `Source/Configuration/ESBuild/Worker.ts` — 2-stage ESBuild config
- `Source/Configuration/ESBuild/Target.ts` — target bundling config
- Caching strategy: CACHE_CORE (network-first nav) + CACHE_ASSET (cache-first
  static)
- Encrypted auth token management with auto-refresh
- Dynamic CSS loading: intercepts CSS imports, returns JS modules triggering
  `<link>` tags

### Dependencies (First Release)

- @playform/build 0.3.1, @types/serviceworker, ulid 3.0.2
