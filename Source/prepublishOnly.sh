#!/usr/bin/env bash

Build "Source/Configuration/**/*.ts" \
	--ESBuild Source/Configuration/ESBuild/Worker.ts

Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild/Target.js
