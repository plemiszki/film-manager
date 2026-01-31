# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Ruby 4.0.1** / **Rails 8.1.1** / **PostgreSQL**
- **Sidekiq 7.2.0** (Redis) for background jobs
- **React 19** + **TypeScript** bundled with **Webpack 5** (Node 24)
- **Clearance** for authentication
- **RSpec** + **Capybara** (Selenium Chrome) + **FactoryBot** for testing

## Commands

```bash
# Start Rails server
bundle exec rails server

# Start Sidekiq worker (required for background jobs)
bundle exec sidekiq

# Frontend — watch mode for development
npm run dev

# Frontend — lint / autofix
npm run lint
npm run lint-fix

# Run all specs
bundle exec rspec

# Run a single spec file
bundle exec rspec spec/models/film_spec.rb

# Run a single spec by line number
bundle exec rspec spec/models/film_spec.rb:42

# Scheduled rake tasks (run via cron/Heroku Scheduler in production)
bundle exec rake box_office_reminders
bundle exec rake payment_reminders
bundle exec rake expiration_reminders
bundle exec rake clear_s3
```

## Architecture Overview

### Request Flow: Two-Layer Controller Pattern

The app splits controllers into two tiers:

1. **Public/read-only controllers** (e.g., `app/controllers/films_controller.rb`) — handle `index` and `show` only, render ERB views. These serve the initial page HTML.
2. **API controllers** (`app/controllers/api/*_controller.rb`) — handle all mutations (create/update/destroy) and return JSON via Jbuilder. All inherit from `AdminController`, which requires login via Clearance and includes the `RenderErrors` concern.

The ERB views contain a single `<div id="some-id">` that React mounts into. The page loads, Rails renders the shell, then React hydrates the interactive UI by hitting the API controllers.

### Frontend: handy-components Library

The React frontend is driven heavily by the **`handy-components`** npm library, which provides generic CRUD components:

- **`SimpleDetails`** — declarative detail/edit form. You pass it an `entityName`, `fields` config, and it auto-generates the UI and wires up GET/PUT/DELETE to the matching API routes. Most simple entity pages (countries, genres, territories, users, etc.) are just a `renderSimpleDetails(...)` call in `frontend/entry.jsx`.
- **`FullIndex`** — a sortable, paginated index table with an optional inline "new entity" modal.
- **`SearchIndex`** — like `FullIndex` but with a search/filter panel (`SearchCriteria` child component).

Complex pages (film details, booking details, royalty reports, etc.) have dedicated custom React components in `frontend/components/`.

The entry point is `frontend/entry.jsx`. On `DOMContentLoaded`, it scans for known element IDs and mounts the appropriate component. Webpack bundles everything to `app/assets/javascripts/me/bundle.js`.

### Background Jobs: Worker → Job Model Pattern

Expensive operations (spreadsheet exports, PDF generation, email sends, data imports) run as Sidekiq workers in `app/workers/`. They follow a consistent pattern:

1. A `Job` record is created before the worker is enqueued, storing a unique `job_id` (timestamp-based).
2. The worker finds the Job by `job_id`, does its work, updates `current_value` for progress.
3. On completion, the result (usually an S3 URL) is stored in `metadata` (a JSONB column) and `status` is set to `'success'`.
4. The frontend polls `GET /api/jobs` to check status and retrieve the download URL.

Workers commonly include `AwsUpload` (for S3 uploads) and `ExportSpreadsheetHelpers` (for xlsx row formatting via caxlsx).

### Key Controller Concerns

- **`RenderErrors`** — standardizes validation error responses. Converts ActiveRecord error keys to camelCase JSON and returns status 422. Use `render_errors(@entity)` on failed saves.
- **`BookingCalculations`** — contains the revenue-split logic for theatrical bookings (90/10, percentage-based, flat vs. percentage weekly terms).
- **`AwsUpload`** — wraps S3 file upload; used by workers.
- **`Reorderable`** — shared logic for drag-and-drop reordering endpoints (many entities have an `order` column and a `rearrange` PATCH route).

### Reorderable Entities

Many entities support drag-and-drop ordering. In routes, look for `patch '/<entity>/rearrange'`. Examples: actors, directors, quotes, laurels, film_genres, film_languages, film_countries, in_theaters_films.

### JSON Convention

API responses use **camelCase keys**. The `RenderErrors` concern explicitly transforms error keys with `camelize(:lower)`. Jbuilder view templates in `app/views/api/` follow this convention. The frontend expects camelCase throughout.

### Scheduled Tasks

`lib/tasks/scheduler.rake` defines tasks meant to run on a schedule (Heroku Scheduler or cron):
- `box_office_reminders` — daily
- `payment_reminders` — Mondays only (checks day of week in code)
- `expiration_reminders` — alerts for expiring film licenses and sublicense rights
- `clear_s3` — cleanup of generated export files

### External Integrations

- **Stripe** — payment processing for venues, DVD customers, and institutions. Customers are created via a dedicated Sidekiq worker (`CreateStripeCustomer`). Each entity that supports Stripe has a `use_stripe` boolean and a `create_in_stripe` API endpoint.
- **Sage** — accounting system. Data is imported via `ImportSageData` worker. Models reference `sage_id` fields for reconciliation.
- **Mailgun** — outbound email via `mailgun-ruby`.
- **AWS S3** — file storage for generated exports and uploaded assets.
- **Sentry** — error tracking.
