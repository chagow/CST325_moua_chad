# syntax=docker/dockerfile:1.7
# The `syntax` directive enables BuildKit features used below:
#   --mount=type=cache  →  persists the npm cache across builds on the same runner
#   --mount=type=bind   →  zero-copy read of build context files (used implicitly)

###############################################################################
# Stage 1 · base
# ─────────────────────────────────────────────────────────────────────────────
# Single place to pin the Node version. Every downstream stage inherits from
# here, so a version bump is a one-line change.
###############################################################################
FROM node:20-alpine AS base

WORKDIR /app

# Copy ONLY the dependency manifests before any source code.
# Because Docker caches each RUN/COPY layer independently, this COPY layer is
# invalidated only when package.json or package-lock.json change — not on
# every source edit. All subsequent npm ci calls hit their own cached layer.
COPY package.json package-lock.json ./


###############################################################################
# Stage 2 · deps  (production dependencies only)
# ─────────────────────────────────────────────────────────────────────────────
# `--omit=dev` keeps devDependencies out of the final image.
# `--mount=type=cache` persists ~/.npm across builds on the same CI runner,
# so packages that haven't changed are served from disk, not the registry.
###############################################################################
FROM base AS deps

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


###############################################################################
# Stage 3 · dev-deps  (all dependencies: prod + dev)
# ─────────────────────────────────────────────────────────────────────────────
# Kept separate from `deps` so devDependencies never leak into the runtime
# image. Only the `test` stage inherits from here.
###############################################################################
FROM base AS dev-deps

RUN --mount=type=cache,target=/root/.npm \
    npm ci


###############################################################################
# Stage 4 · test
# ─────────────────────────────────────────────────────────────────────────────
# CI targets this stage first:
#   docker build --target test --cache-from type=gha .
#
# If tests fail the build stops here — the runtime image is never produced
# and nothing is pushed to the registry.
#
# Rebuild cost: near-zero when only test code changes, because dev-deps is
# a fully cached layer from stage 3.
###############################################################################
FROM dev-deps AS test

# Source and test files are copied here, not in earlier stages, so a source
# change doesn't bust the `npm ci` cache in stages 2 and 3.
COPY src/  ./src/
COPY test/ ./test/

# node --test auto-discovers *.test.js files (Node 20 built-in test runner).
RUN node --test


###############################################################################
# Stage 5 · runtime  (the image that gets pushed and deployed)
# ─────────────────────────────────────────────────────────────────────────────
# Starts from a fresh base image so no build tools, devDependencies, or test
# files ever reach production. Docker only includes layers reachable from this
# final stage in the exported image.
###############################################################################
FROM node:20-alpine AS runtime

WORKDIR /app

# Create a non-root user before COPY so --chown works in a single step
# (avoids a separate RUN chown that would add a layer on top of large files).
RUN addgroup -S app && adduser -S app -G app

# Pull prod node_modules from stage 2, NOT from dev-deps (stage 3).
# Copying from dev-deps would include devDependencies and roughly double size.
COPY --from=deps  --chown=app:app /app/node_modules ./node_modules

# Copy only the files the server needs at runtime.
COPY --chown=app:app package.json ./
COPY --chown=app:app src/         ./src/

USER app

# Set NODE_ENV so Express (and other frameworks) enable production optimisations
# such as response caching and condensed error output.
ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# Run node directly (no shell wrapper) so SIGTERM reaches the process and
# graceful shutdown works correctly in Kubernetes / ECS / Cloud Run.
CMD ["node", "src/server.js"]
