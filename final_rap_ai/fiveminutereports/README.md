# FiveMinuteReports

Generate client-ready marketing reports in minutes, not hours.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.local.example` to `.env.local` and fill in your values.

3. **Set up database:**

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser.

## Testing
Run the E2E test to verify the core flow:

```bash
npx playwright install
npm test
```

## Deployment
See `DEPLOYMENT.md` for detailed deployment instructions.

## Features
✅ User authentication

✅ Agency branding

✅ Client management

✅ Report generation with mock data

✅ PDF download

✅ Shareable public links

✅ Event logging
