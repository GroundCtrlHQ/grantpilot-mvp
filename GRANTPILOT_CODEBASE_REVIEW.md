# GrantPilot MVP - Complete Codebase Review

## Project Overview

**GrantPilot** is a comprehensive SaaS prototype designed for nonprofits to manage grant applications with AI-powered writing assistance. Built with Next.js 14+ and modern web technologies, it provides a complete grant lifecycle management solution.

**Current Development Stage**: MVP (Minimum Viable Product) - 80% of core features implemented
- **Grant Search & Discovery**: 80% complete
- **Application Management**: 15% complete
- **AI Writing Assistant**: 5% complete

## Technology Stack

### Frontend & Framework
- **Next.js 14+** with App Router architecture
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library (Radix UI primitives)
- **Lucide React** for icons

### AI & Machine Learning
- **Anthropic Claude 3.5 Sonnet** via Vercel AI SDK
- **AI-powered grant application scoring** (0-100 scale)
- **Real-time feedback** and content analysis
- **Smart checklist generation** from grant documents

### Data & Storage
- **localStorage** for prototype data persistence
- **PostgreSQL** database schema prepared (migration scripts ready)
- **Neon Database** configured for production

### Authentication & Security
- **Fake authentication** (localStorage-based) for prototype
- **Prepared for Clerk** integration in production

## Project Structure

```
/Users/noahsark/Downloads/grantpilot-mvp/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI-powered features
│   │   │   ├── score/           # Grant application scoring
│   │   │   └── real-time-analysis/ # Live feedback
│   │   ├── analyze-document/     # PDF analysis
│   │   ├── grants/              # Grant management
│   │   │   ├── rss/             # Grant RSS feeds
│   │   │   └── search/          # Grant search API
│   │   ├── process-pdf/         # PDF processing
│   │   └── update-checklist/    # Checklist updates
│   ├── applications/             # Application management
│   │   ├── [id]/                # Individual applications
│   │   │   ├── analyze/         # Document analysis
│   │   │   ├── update/          # Status updates
│   │   │   └── write/           # AI writing interface
│   │   └── page.tsx             # Applications list
│   ├── dashboard/               # Main dashboard
│   ├── globals.css              # Global styles
│   ├── grants/                  # Grant browsing
│   │   ├── [oppNumber]/         # Individual grant details
│   │   └── page.tsx             # Grants search page
│   ├── layout.tsx               # Root layout
│   ├── login/                   # Authentication
│   ├── onboarding/              # User onboarding
│   ├── page.tsx                 # Landing page
│   ├── prepare/                 # Application preparation
│   ├── projects/                # Project management
│   └── write/                   # Writing interface
├── components/                  # React components
│   ├── ai-grant-search.tsx     # AI-powered grant search
│   ├── application-list.tsx    # Application listings
│   ├── application-progress.tsx # Progress tracking
│   ├── auth-guard.tsx         # Authentication wrapper
│   ├── dashboard-layout.tsx   # Dashboard layout
│   ├── dashboard-stats.tsx    # Dashboard statistics
│   ├── document-analyzer.tsx  # Document analysis
│   ├── error-boundary.tsx     # Error handling
│   ├── freemium-grant-card.tsx # Free tier grant cards
│   ├── grant-card.tsx         # Grant display cards
│   ├── grant-filters.tsx      # Grant filtering
│   ├── grants-gov-search.tsx  # Grants.gov integration
│   ├── live-feedback-panel.tsx # Real-time AI feedback
│   ├── loading-spinner.tsx    # Loading states
│   ├── onboarding-success.tsx # Onboarding completion
│   ├── onboarding-wizard.tsx  # User onboarding flow
│   ├── pdf-grant-analyzer.tsx # PDF analysis
│   ├── pipeline-cards.tsx     # Pipeline visualization
│   ├── recent-applications-section.tsx # Recent apps dashboard
│   ├── saved-grants-section.tsx # Saved grants dashboard
│   ├── score-panel.tsx        # AI scoring display
│   ├── sidebar.tsx            # Navigation sidebar
│   ├── smart-checklist.tsx    # AI-generated checklists
│   ├── status-badge.tsx       # Status indicators
│   ├── theme-provider.tsx     # Dark/light theme
│   ├── theme-toggle.tsx       # Theme switcher
│   ├── ui/                    # shadcn/ui components
│   │   ├── accordion.tsx      # Collapsible content
│   │   ├── alert-dialog.tsx   # Confirmation dialogs
│   │   ├── alert.tsx          # Status alerts
│   │   ├── aspect-ratio.tsx   # Responsive ratios
│   │   ├── avatar.tsx         # User avatars
│   │   ├── badge.tsx          # Status badges
│   │   ├── breadcrumb.tsx     # Navigation breadcrumbs
│   │   ├── button.tsx         # Action buttons
│   │   ├── calendar.tsx       # Date picker
│   │   ├── card.tsx           # Content cards
│   │   ├── carousel.tsx       # Image/content carousel
│   │   ├── chart.tsx          # Data visualization
│   │   ├── checkbox.tsx       # Checkboxes
│   │   ├── collapsible.tsx    # Collapsible sections
│   │   ├── command.tsx        # Command palette
│   │   ├── context-menu.tsx   # Right-click menus
│   │   ├── dialog.tsx         # Modal dialogs
│   │   ├── drawer.tsx         # Slide-out panels
│   │   ├── dropdown-menu.tsx  # Dropdown menus
│   │   ├── form.tsx           # Form components
│   │   ├── hover-card.tsx     # Hover cards
│   │   ├── input-otp.tsx      # OTP input
│   │   ├── input.tsx          # Text inputs
│   │   ├── label.tsx          # Form labels
│   │   ├── menubar.tsx        # Menu bars
│   │   ├── navigation-menu.tsx # Navigation menus
│   │   ├── pagination.tsx     # Pagination
│   │   ├── popover.tsx        # Popover menus
│   │   ├── progress.tsx       # Progress bars
│   │   ├── radio-group.tsx    # Radio buttons
│   │   ├── resizable.tsx      # Resizable panels
│   │   ├── scroll-area.tsx    # Scrollable areas
│   │   ├── select.tsx         # Select dropdowns
│   │   ├── separator.tsx      # Visual separators
│   │   ├── sheet.tsx          # Side sheets
│   │   ├── sidebar.tsx        # Sidebar component
│   │   ├── skeleton.tsx       # Loading skeletons
│   │   ├── slider.tsx          # Range sliders
│   │   ├── sonner.tsx         # Toast notifications
│   │   ├── switch.tsx          # Toggle switches
│   │   ├── table.tsx           # Data tables
│   │   ├── tabs.tsx            # Tab navigation
│   │   ├── textarea.tsx        # Text areas
│   │   ├── toast.tsx           # Toast system
│   │   ├── toaster.tsx         # Toast provider
│   │   ├── toggle-group.tsx   # Toggle groups
│   │   ├── toggle.tsx          # Toggle buttons
│   │   ├── tooltip.tsx         # Tooltips
│   │   └── use-mobile.tsx     # Mobile detection
│   ├── upgrade-modal.tsx      # Premium upgrade prompts
│   ├── urgent-deadlines-section.tsx # Deadline alerts
│   └── writing-editor.tsx     # Rich text editor
├── hooks/                     # Custom React hooks
│   ├── use-mobile.ts         # Mobile device detection
│   └── use-toast.ts          # Toast notifications
├── lib/                      # Utility libraries
│   ├── auth.ts              # Authentication utilities
│   ├── claude-pdf.ts        # PDF processing with Claude
│   ├── database.ts          # Database connection
│   ├── date-utils.ts        # Date formatting utilities
│   ├── grants-api.ts        # Grants.gov API integration
│   ├── storage.ts           # localStorage data management
│   └── utils.ts             # General utilities
├── scripts/                 # Database setup scripts
│   ├── 001_create_users_table.sql      # User management
│   ├── 002_create_grants_table.sql     # Grant storage
│   ├── 003_create_applications_table.sql # Application tracking
│   ├── 004_create_checklists_table.sql  # AI checklists
│   ├── 005_create_saved_grants_table.sql # Saved grants
│   └── 006_seed_sample_data.sql        # Sample data
├── styles/                  # CSS styles
│   └── globals.css          # Global CSS
└── public/                  # Static assets
    ├── placeholder-logo.png # Logo placeholder
    ├── placeholder-logo.svg # SVG logo
    ├── placeholder-user.jpg # User avatar
    ├── placeholder.jpg      # General placeholder
    └── placeholder.svg      # SVG placeholder
```

## Core Functionality

### 1. Grant Discovery & Search (`/app/grants/`, `/app/api/grants/`)

**Files Involved:**
- `app/grants/page.tsx` - Main grants search interface
- `app/grants/[oppNumber]/page.tsx` - Individual grant details
- `app/api/grants/search/route.tsx` - Grants.gov API integration
- `app/api/grants/rss/route.ts` - RSS feed processing
- `components/grant-card.tsx` - Grant display cards
- `components/grant-filters.tsx` - Advanced filtering
- `components/grants-gov-search.tsx` - Search integration

**Key Features:**
- **Real-time search** against grants.gov database
- **Advanced filtering** by agency, category, deadline, funding amount
- **RSS feed integration** for automatic updates
- **Smart categorization** and tagging system
- **Fallback mock data** when API unavailable

**API Integration:**
- Uses `simpler.grants.gov` for search queries
- Parses HTML responses for grant data extraction
- Implements fallback system with sample AI/grants data

### 2. Application Management (`/app/applications/`)

**Files Involved:**
- `app/applications/page.tsx` - Application pipeline overview
- `app/applications/[id]/page.tsx` - Individual application details
- `app/applications/[id]/write/page.tsx` - AI writing interface
- `app/applications/[id]/update/page.tsx` - Status updates
- `app/applications/[id]/analyze/page.tsx` - Document analysis
- `components/application-list.tsx` - Application listings
- `components/pipeline-cards.tsx` - Pipeline visualization

**Key Features:**
- **Multi-stage pipeline** tracking (draft → submitted → awarded)
- **Rich text editor** with AI assistance
- **Real-time progress** monitoring
- **Document upload** and analysis capabilities

### 3. AI-Powered Writing Assistant

**Files Involved:**
- `app/api/ai/score/route.ts` - Application scoring algorithm
- `app/api/real-time-analysis/route.ts` - Live feedback
- `components/writing-editor.tsx` - Rich text editor
- `components/score-panel.tsx` - Score display and breakdown
- `components/live-feedback-panel.tsx` - Real-time suggestions
- `components/smart-checklist.tsx` - AI-generated requirements

**AI Features:**
- **0-100 scoring system** across 4 criteria:
  - Clarity & Structure (0-25 points)
  - Specificity & Evidence (0-25 points)
  - Alignment with grant priorities (0-25 points)
  - Completeness (0-25 points)
- **Real-time feedback** as users type
- **Smart checklist generation** from grant documents
- **Actionable recommendations** for improvement

**Technical Implementation:**
- Uses Anthropic Claude 3.5 Sonnet model
- Structured JSON responses for consistent scoring
- Temperature 0.3 for consistent, professional feedback

### 4. Dashboard & Analytics (`/app/dashboard/`)

**Files Involved:**
- `app/dashboard/page.tsx` - Main dashboard
- `components/dashboard-layout.tsx` - Layout wrapper
- `components/dashboard-stats.tsx` - Statistics display
- `components/saved-grants-section.tsx` - Saved grants overview
- `components/recent-applications-section.tsx` - Recent activity
- `components/urgent-deadlines-section.tsx` - Deadline alerts

**Features:**
- **Real-time statistics** and progress tracking
- **Urgent deadline notifications**
- **Saved grants management**
- **Recent application activity**
- **Quick action shortcuts**

### 5. User Authentication & Onboarding

**Files Involved:**
- `app/login/page.tsx` - Authentication interface
- `app/onboarding/page.tsx` - User setup flow
- `components/onboarding-wizard.tsx` - Step-by-step onboarding
- `components/onboarding-success.tsx` - Completion confirmation
- `components/auth-guard.tsx` - Route protection

**Authentication Strategy:**
- **Prototype**: localStorage-based fake auth
- **Production Ready**: Prepared for Clerk integration
- **User Profiles**: Organization type, focus areas, contact info

### 6. Document Analysis & Processing

**Files Involved:**
- `app/api/analyze-document/route.ts` - Document analysis API
- `app/api/process-pdf/route.ts` - PDF processing
- `app/api/analyze-grant-documents/route.ts` - Grant document analysis
- `components/document-analyzer.tsx` - Document analysis UI
- `components/pdf-grant-analyzer.tsx` - PDF-specific analysis
- `lib/claude-pdf.ts` - PDF processing utilities

**Capabilities:**
- **PDF text extraction** and analysis
- **Grant requirement identification**
- **Document structure analysis**
- **AI-powered insights** from uploaded files

## Data Architecture

### Database Schema (PostgreSQL)

**Users Table** (`scripts/001_create_users_table.sql`)
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- first_name, last_name (VARCHAR)
- organization, organization_type (VARCHAR)
- focus_areas (TEXT ARRAY)
- timestamps
```

**Grants Table** (`scripts/002_create_grants_table.sql`)
```sql
- id (SERIAL PRIMARY KEY)
- opp_number (VARCHAR UNIQUE)
- title, agency, description (TEXT)
- eligibility, funding_amount (VARCHAR)
- deadline (DATE)
- categories (TEXT ARRAY)
- timestamps
```

**Applications Table** (`scripts/003_create_applications_table.sql`)
```sql
- id (SERIAL PRIMARY KEY)
- user_id, grant_id (INTEGER REFERENCES)
- opp_number (VARCHAR)
- status (VARCHAR) - draft/submitted/awarded
- project_title, project_summary, project_narrative (TEXT)
- uploaded_files (JSONB)
- timestamps
```

**Checklists Table** (`scripts/004_create_checklists_table.sql`)
```sql
- id (SERIAL PRIMARY KEY)
- application_id (INTEGER REFERENCE)
- requirements (JSONB) - AI-generated checklist items
- ai_analysis (JSONB) - Analysis metadata
- timestamps
```

**Saved Grants Table** (`scripts/005_create_saved_grants_table.sql`)
```sql
- id (SERIAL PRIMARY KEY)
- user_id, grant_id (INTEGER REFERENCES)
- opp_number (VARCHAR)
- interest_level (VARCHAR) - interested/applying/not_interested
- timestamps
- UNIQUE constraint on (user_id, grant_id)
```

### localStorage Data Structure

**Current Prototype Storage:**
- `grantpilot_user` - User session data
- `grantpilot_grants` - All loaded grants
- `grantpilot_saved` - User's saved grants
- `grantpilot_applications` - User's applications
- `grantpilot_status_updates` - Application status history

## Component Architecture

### Layout System
- **DashboardLayout** - Main application shell with sidebar navigation
- **ThemeProvider** - Dark/light mode support
- **ErrorBoundary** - Global error handling
- **AuthGuard** - Route protection wrapper

### UI Components (shadcn/ui)
- **Card, Button, Input, Dialog** - Core interaction elements
- **Table, Tabs, Accordion** - Data display components
- **Alert, Badge, Progress** - Status and feedback components
- **Select, Checkbox, RadioGroup** - Form controls

### Specialized Components
- **WritingEditor** - Rich text editor with AI features
- **ScorePanel** - AI scoring visualization
- **SmartChecklist** - Dynamic requirement tracking
- **LiveFeedbackPanel** - Real-time AI suggestions

## API Architecture

### Grant Discovery APIs
- **GET /api/grants/search** - Search grants.gov database
- **GET /api/grants/rss** - Process RSS feeds for updates

### AI-Powered APIs
- **POST /api/ai/score** - Score grant applications (0-100)
- **POST /api/real-time-analysis** - Live feedback during writing
- **POST /api/analyze-document** - Analyze uploaded documents

### Application Management APIs
- **POST /api/update-checklist** - Update checklist items
- **POST /api/process-pdf** - Process PDF documents

## Key Features Breakdown

### 1. Smart Grant Search
- **Real-time search** against federal grant database
- **Advanced filters** by deadline, funding amount, category
- **Intelligent categorization** and tagging
- **RSS feed integration** for automatic updates

### 2. AI Writing Assistant
- **Context-aware scoring** (0-100 scale)
- **Four-criteria evaluation**:
  - Clarity & Structure
  - Specificity & Evidence
  - Alignment with priorities
  - Completeness
- **Real-time feedback** as users write
- **Actionable recommendations** for improvement

### 3. Application Pipeline Management
- **Multi-stage tracking** (draft → submitted → awarded)
- **Progress visualization** and status updates
- **Document upload** and analysis
- **Collaborative features** ready for implementation

### 4. Dashboard Analytics
- **Real-time statistics** and progress tracking
- **Urgent deadline notifications**
- **Saved grants management**
- **Recent activity feeds**

## Current Limitations & Future Enhancements

### Prototype Limitations
- **localStorage only** - No persistent backend
- **Fake authentication** - No real user management
- **No file uploads** - Document analysis not fully implemented
- **Mock AI responses** - Limited by API rate limits

### Production Readiness Path
1. **Database Migration** - Move from localStorage to PostgreSQL
2. **Authentication** - Implement Clerk or similar
3. **File Storage** - Add cloud storage for document uploads
4. **Real-time Collaboration** - Multi-user editing capabilities
5. **Advanced AI Features** - Custom model training on successful applications
6. **Payment Integration** - Freemium model with premium features

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Set up environment variables
ANTHROPIC_API_KEY=your_claude_api_key_here

# Run development server
npm run dev

# Access at http://localhost:3000
```

### Key Development Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm run start` - Production server

## Code Quality & Best Practices

### Architecture Patterns
- **App Router** - Modern Next.js routing
- **Server Components** - Optimized rendering
- **Custom hooks** - Reusable logic
- **TypeScript** - Type safety throughout

### Styling Approach
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Consistent component library
- **Responsive design** - Mobile-first approach
- **Dark mode support** - Theme switching

### AI Integration
- **Vercel AI SDK** - Standardized AI model integration
- **Structured prompts** - Consistent AI responses
- **Error handling** - Graceful degradation
- **Rate limiting** - API usage management

## Security Considerations

### Current State (Prototype)
- **No authentication** - Development mode only
- **Client-side storage** - Not suitable for sensitive data
- **API keys exposed** - Environment variables needed

### Production Security
- **Clerk authentication** - Proper user management
- **Database encryption** - Sensitive data protection
- **API key management** - Secure credential storage
- **Input validation** - XSS and injection prevention

## Performance Optimizations

### Implemented
- **Image optimization** - Next.js Image component
- **Code splitting** - Automatic route-based splitting
- **Caching strategies** - API response caching
- **Bundle optimization** - Tree shaking and minification

### Future Enhancements
- **CDN integration** - Static asset delivery
- **Database indexing** - Query performance
- **API rate limiting** - Usage management
- **Progressive Web App** - Offline capabilities

## Deployment & Hosting

### Current Setup
- **Vercel** - Optimized for Next.js deployment
- **Environment variables** - API key management
- **Analytics** - Vercel Analytics integration

### Production Configuration
- **Database**: Neon PostgreSQL
- **File Storage**: Vercel Blob or AWS S3
- **Authentication**: Clerk
- **Monitoring**: Vercel Analytics + custom logging

## Conclusion

GrantPilot represents a well-architected MVP with modern web technologies and AI integration. The codebase demonstrates:

- **Clean architecture** with clear separation of concerns
- **Scalable component design** using shadcn/ui
- **AI-first approach** with practical implementation
- **Production-ready patterns** despite prototype status
- **Comprehensive feature set** for grant management

The project is well-positioned for production deployment with minimal refactoring required for the core architecture.
