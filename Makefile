# ============================================
# CarGA — Makefile
# ============================================
# All development commands in one place.
# Run `make help` to see available targets.
# ============================================

.PHONY: dev build clean test test-coverage typecheck lint ci e2e e2e-install help

# --- Development ---

dev: ## Start Next.js development server
	pnpm dev

dev-static: ## Serve static landing page + prototype on port 3000
	npx serve public/landing -l 3001

# --- Build ---

build: ## Build production bundle
	pnpm build

clean: ## Remove build artifacts
	rm -rf .next out node_modules coverage test-results playwright-report

# --- Testing ---

test: ## Run unit tests
	pnpm test

test-coverage: ## Run tests with coverage report (80% threshold)
	pnpm test:coverage

e2e: ## Run Playwright E2E tests
	pnpm test:e2e

e2e-install: ## Install Playwright browsers (first time setup)
	npx playwright install chromium

# --- Code Quality ---

typecheck: ## Run TypeScript type checking
	pnpm typecheck

lint: ## Run ESLint
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint --fix

# --- CI Pipeline ---

ci: lint typecheck test build ## Full CI: lint, typecheck, test, build

# --- Database ---

db-push: ## Apply Supabase migrations
	supabase db push

db-seed: ## Load seed data
	supabase db seed

db-reset: ## Reset local database (destructive)
	supabase db reset

db-types: ## Regenerate TypeScript types from database
	pnpm db:gen-types

db-studio: ## Open Supabase Studio
	@echo "Open http://localhost:54323 in your browser"
	supabase start

# --- Deployment ---

deploy-preview: ## Deploy preview to Vercel
	vercel

deploy-prod: ## Deploy to production (requires confirmation)
	vercel --prod

# --- Help ---

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
