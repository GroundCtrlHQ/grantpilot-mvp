# Grant Pilot MVP

A grant management SaaS prototype for nonprofits with AI-powered writing assistance.

## Features

- **Grant Search & Discovery (80%)**: Browse and filter grants from grants.gov with advanced search capabilities
- **Application Management (15%)**: Track applications through pipeline stages with status updates
- **AI Writing Assistant (5%)**: Get AI-powered feedback and scoring on grant applications

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **Data**: localStorage for prototype (no backend required)
- **AI**: Claude Sonnet 4 via Vercel AI SDK
- **Authentication**: Fake auth for prototype (localStorage-based)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   \`\`\`
   ANTHROPIC_API_KEY=your_claude_api_key_here
   \`\`\`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Login**: Enter any email to sign in (no password required)
2. **Load Grants**: Click "Refresh Grants" to load mock grant data
3. **Search & Filter**: Use the advanced filters to find relevant grants
4. **Save Grants**: Click the heart icon to save interesting opportunities
5. **Start Applications**: Begin writing applications directly from grant details
6. **AI Assistance**: Use "Check My Score" to get AI feedback on your writing
7. **Track Progress**: Monitor applications through the pipeline dashboard

## Key Pages

- `/login` - Simple email-only login
- `/dashboard` - Overview of saved grants, applications, and deadlines
- `/grants` - Search and browse available grants
- `/grants/[oppNumber]` - Detailed grant information
- `/applications` - Application pipeline and management
- `/applications/[id]` - Individual application details
- `/applications/[id]/write` - AI-powered writing interface
- `/applications/[id]/update` - Status update form

## Data Storage

All data is stored in localStorage with these keys:
- `grantpilot_user` - User session data
- `grantpilot_grants` - All loaded grants
- `grantpilot_saved` - User's saved grants
- `grantpilot_applications` - User's applications
- `grantpilot_status_updates` - Application status history

## Migration Path

This prototype uses localStorage and fake authentication for rapid development. To add a real backend:

1. Replace localStorage with Prisma + database
2. Add Clerk or similar for real authentication
3. Move RSS sync to server-side cron job
4. Add proper API routes with auth middleware
5. Enable multi-device sync

## Design System

- **Primary Blue**: #2563eb (main actions, links)
- **Success Green**: #10b981 (awarded status, positive feedback)
- **Warning Orange**: #f97316 (approaching deadlines)
- **Danger Red**: #ef4444 (urgent deadlines, errors)
- **Typography**: Inter font family
- **Components**: Modern SaaS dashboard aesthetic with cards and clean layouts

## License

This is a prototype application built with v0.
