# Changelog

All notable changes to the Worker element are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.5.0] — 2026 Q2

### Added

- Expanded README with architecture diagrams and usage guide
- See Also section linking to architecture overview and related Elements

### Changed

- Wrapped service worker registration in IIFE with early return
- Simplified ESBuild target configuration structure
- Reformatted ESBuild configuration files for consistency
- Used POSIX-compliant sh shebang in build scripts
- Rebuilt target files following ESBuild configuration changes

### Fixed

- Corrected HTML tag structure in README header

## [0.4.0] — 2026 Q1

### Added

- .gitignore to exclude build artifacts

### Changed

- Restored development-readable build artifacts with source maps
- Minified Service Worker build artifacts for production
- Updated Service Worker build artifacts
- Upgraded @playform/build from 0.2.5 to 0.3.0
- Updated dependencies

### Fixed

- Prevented Service Worker refresh loop with version tracking
- Adjusted script URL validation regex to support nested paths and MJS modules
- Addressed code scanning security alert

## [0.3.0] — 2025 Q4

### Changed

- Updated dependencies

## [0.2.0] — 2025 Q3

### Added

- Initial web worker module for background processing
- Generated web worker bundle for extension host communication
- Application route to routing configuration

### Changed

- Refactored ESBuild configuration and updated worker artifacts
- Removed obsolete shim cache from service worker logic
- Simplified dynamic CSS loading mechanism
- Renamed Skip=Worker query parameter to Skip=Intercept for clarity
- Optimized service worker registration flow with proper module type and scope
- Minified all worker scripts for production
- Eliminated source map generation to reduce deployment footprint
- Improved variable naming and error handling in service worker
- Enhanced service worker security and version tracking
- Relicensed project under CC0 1.0 Universal

### Fixed

- Used configured outdir for build cleanup
- Corrected precache list by removing erroneous path entry

## [0.1.0] — 2025 Q2

### Added

- Initial web worker implementation for background processing
- Service worker with cache-first strategy and CSS interception
- ESBuild-based build configuration with environment-based settings
- Service worker registration with feature detection
- Remote cache support

### Changed

- Normalized application path and updated shim reference
- Consolidated ESBuild configuration and exclusion logic
- Relicensed under Land Public License v1.0
- Updated dependencies

## [0.0.1] — 2025 Q1

### Added

- Initial service worker infrastructure
- CI/CD workflows with GitHub Actions (cache, upload-artifact, setup-node)
- Dependabot configuration for automated dependency updates
