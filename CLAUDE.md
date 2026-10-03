# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Ruby 4.0.7** / **Rails 8.1.4** / **PostgreSQL**
- **Sidekiq 8.1** (Redis) for background jobs
- **React 19** + **TypeScript** bundled with **Vite 8** via `vite_rails` (Node 24)
- **Clearance** for authentication
- **RSpec** + **Capybara** (Selenium Chrome) + **FactoryBot** for testing

## Commands

```bash
# Start Rails server
bundle exec rails server

# Start Sidekiq worker (required for background jobs)
bundle exec sidekiq

# Frontend — Vite dev server with React hot reload (run alongside rails server)
bin/vite dev

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

- **`SimpleDetails`** — declarative detail/edit form. You pass it an `entityName`, `fields` config, and it auto-generates the UI and wires up GET/PUT/DELETE to the matching API routes. Most simple entity pages (countries, genres, territories, users, etc.) are just a `renderSimpleDetails(...)` call in `frontend/entrypoints/application.jsx`.
- **`FullIndex`** — a sortable, paginated index table with an optional inline "new entity" modal.
- **`SearchIndex`** — like `FullIndex` but with a search/filter panel (`SearchCriteria` child component).

Complex pages (film details, booking details, royalty reports, etc.) have dedicated custom React components in `frontend/components/`.

The entry point is `frontend/entrypoints/application.jsx`. On `DOMContentLoaded`, it scans for known element IDs and mounts the appropriate component. Vite (config in `vite.config.mts` and `config/vite.json`) builds it, and the layout loads it with `vite_javascript_tag`. `rake assets:precompile` runs the production build into `public/vite`. styled-jsx is applied through `@rolldown/plugin-babel`.

Sprockets (`app/assets/javascripts/application.js`) still serves jQuery, jQuery UI, bootstrap, the `Tools` and `Images` globals, and all SCSS. It loads as a classic script before the Vite module, so React code can use those globals.

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

### Public Website API

A separate public API exists at `/api/website/*` for the company website. These controllers inherit from `CyberController` (not `AdminController`) and authenticate via the `CYBER_NY_API_KEY` environment variable instead of Clearance sessions. Endpoints: films, bookings, merchandise.

### User Access Levels

The `User` model defines three access levels via enum: `user` (50), `admin` (100), `super_admin` (150). The frontend checks `FM.user.hasAdminAccess` and `FM.user.hasSuperAdminAccess`. Sign-up and password reset are disabled: `allow_sign_up = false`, and `config/routes.rb` only defines Clearance's sign-in, session, and sign-out routes.

### Frontend Shared Object: FM

`frontend/common.jsx` exports an `FM` object that components import (it is not a `window` global). `FM.initialize()` runs on page load and populates:
- Current user info (`FM.user.id`, `FM.user.access`, `FM.user.hasAdminAccess`, `FM.user.hasSuperAdminAccess`)
- URL params (`FM.params`)

It also provides `changeSearchText` (bound to a component) and `canIDrop` (jQuery UI drop check).

### Email Tracking

Outbound emails go through the `SendEmail` service (`app/services/send_email.rb`) and are tracked via the `Email` model with statuses: `pending`, `delivered`, `failed`, `bounced`. Mailgun webhooks update delivery status. Setting `TEST_MODE` env var redirects all emails to `TEST_MODE_EMAIL`.

### Testing Patterns

- **Feature specs** use Capybara with Selenium Chrome and DatabaseCleaner (truncation strategy, not transactions)
- A global `$admin_user` is created for feature specs
- Custom helpers in `spec/support/features_helper.rb`: `fill_out_form`, `search_index`, `select_from_modal`, `click_btn`, `wait_for_spinner`
- `use_transactional_fixtures = false`
- Sidekiq runs in fake mode suite-wide (`Sidekiq.testing!(:fake)` in `rails_helper.rb`); specs that need jobs to run call `Sidekiq.testing!(:inline)`
- `Capybara.disable_animation = true`, so CSS transitions and jQuery animations are off in feature specs

Conventions for keeping feature specs reliable:
- Use `wait_for_spinner` rather than checking `.spinner` directly. It retries if the page navigates mid-check (Chrome's "Node with given id does not belong to the document" error). Pass `wait:` for slow operations.
- `click_btn(text)` clicks a link and waits until it is not `.disabled`. `click_btn(text, :submit)` clicks a submit input. Any other type raises.
- Don't use `sleep`. Wait on a Capybara matcher instead (e.g. `open_nice_select` waits for the dropdown's `.open` class).

### Key Model Concerns

- **`DateFieldYearsConverter`** — converts 2-digit years to 4-digit (68+ → 19xx, <68 → 20xx)
- **`StripeHelpers`** — shared Stripe customer creation logic

### PostgreSQL Extensions

The schema uses `pg_trgm` (trigram matching) for fuzzy search, alongside `textacular` gem.

### External Integrations

- **Stripe** — payment processing for venues, DVD customers, and institutions. Customers are created via a dedicated Sidekiq worker (`CreateStripeCustomer`). Each entity that supports Stripe has a `use_stripe` boolean and a `create_in_stripe` API endpoint.
- **Sage** — accounting system. Data is imported via `ImportSageData` worker. Models reference `sage_id` fields for reconciliation.
- **Mailgun** — outbound email via `mailgun-ruby`. Delivery tracked via webhooks and `Email` model.
- **AWS S3** — file storage for generated exports and uploaded assets.
- **Sentry** — error tracking.
- **Headless Chrome (Ferrum)**: renders the PDFs for invoices, credit memos and royalty statements. Everything goes through `GeneratePdf` (`app/services/generate_pdf.rb`): A4, 10mm margins, `scale: 0.8`. The scale keeps the hard-coded row-based page breaks working. Fonts are bundled in `lib/pdf_fonts` and embedded as base64. Chrome is found on `PATH`, or set `BROWSER_PATH`. On Heroku it comes from the Chrome for Testing buildpack.
