# CGMH EHRCALC on FHIR

Clinical calculator web app with SMART on FHIR integration.

- Purpose: provide point-of-care clinical calculators with optional FHIR auto-fill
- Stack: TypeScript, JavaScript, HTML/CSS, Nginx, Docker
- Scope: 90+ calculators (risk scores, formulas, conversions, pediatrics, critical care)

## Quick Start (Docker)

### 1. Build and run

```bash
docker compose up -d --build
```

### 2. Open pages

- App: http://localhost:8080
- Launch page: http://localhost:8080/launch.html
- Health check: http://localhost:8080/health-check.html
- Calculator test page: http://localhost:8080/test-calculators.html

### 3. Stop

```bash
docker compose down
```

## SMART on FHIR Test

Use SMART Health IT Launcher:

1. Go to https://launch.smarthealthit.org/
2. Set App Launch URL to `http://localhost:8080/launch.html`
3. Choose FHIR R4 sandbox and a test patient
4. Click Launch

## Local Dev (without Docker)

Use any static file server at project root:

```bash
npx http-server -p 8000
```

Then open:

- http://localhost:8000
- http://localhost:8000/launch.html

## Project Layout (Simplified)

```text
.
├── index.html                 # main list page
├── calculator.html            # single calculator page
├── launch.html                # SMART launch bootstrap
├── health-check.html          # runtime checks
├── test-calculators.html      # calculator loading test UI
├── src/                       # TypeScript source
├── js/                        # runtime JavaScript output/modules
├── css/                       # styles
├── docs/                      # architecture and developer docs
├── text/                      # additional guides/reports
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

## Common Commands

```bash
# install deps
npm install

# compile TypeScript
npm run build:ts

# run tests
npm test
```

## CSP / FHIR Endpoint Note

If SMART launch fails with a CSP `connect-src` error, add your FHIR launcher domain to CSP allowlist in:

- `nginx.conf`
- HTML pages using meta CSP (`launch.html`, `calculator.html`, `health-check.html`)

After CSP changes, rebuild/restart Docker:

```bash
docker compose up -d --build
```

## Key Docs

- Docker guide: [text/README_DOCKER.md](text/README_DOCKER.md)
- Developer guide: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
- Calculator style guide: [text/CALCULATOR_STYLE_GUIDE.md](text/CALCULATOR_STYLE_GUIDE.md)
- Calculator testing guide: [text/CALCULATOR_TESTING_GUIDE.md](text/CALCULATOR_TESTING_GUIDE.md)

## Contributing

PRs are welcome.

Minimum expectation before opening PR:

1. Build passes
2. Tests pass
3. New calculator logic includes tests
4. Documentation is updated when behavior changes