# ThreatScanWithVARSHA - Threat Intelligence Platform

## Overview

ThreatScanWithVARSHA is a professional threat intelligence platform designed for batch reputation checking of file hashes and IP addresses. The application enables security analysts to analyze multiple Indicators of Compromise (IOCs) simultaneously, providing detailed vendor results and threat assessments powered by the VirusTotal API.

The platform supports:
- Batch scanning of file hashes (MD5, SHA1, SHA256) and IP addresses
- Real-time threat intelligence from VirusTotal
- Detailed vendor analysis and detection results
- Export capabilities (CSV/JSON)
- Dark/light theme support
- Responsive, enterprise-grade security dashboard UI

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, chosen for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (single-page dashboard architecture)

**UI Component System**
- shadcn/ui component library with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system based on Carbon Design System principles with security dashboard patterns
- Dark mode support via ThemeProvider with localStorage persistence
- Custom color palette optimized for threat intelligence visualization (malicious/red, suspicious/amber, clean/green, unknown/blue)

**State Management**
- TanStack Query (React Query) for server state management and API caching
- Local component state with React hooks for UI interactions
- No global state library needed due to simple data flow

**Typography & Fonts**
- Inter font family for primary text (optimized for data tables and readability)
- JetBrains Mono for technical data display (hashes, IPs, monospace content)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- RESTful API design pattern for simplicity
- Single-route architecture (`/api/scan` POST endpoint for batch scanning)

**Data Flow**
1. Client submits batch of indicators (hashes/IPs) via POST request
2. Server validates input using Zod schemas
3. VirusTotalService handles external API integration with rate limiting awareness
4. Results stored in-memory (MemStorage) for session persistence
5. Response includes successful scans and any errors encountered

**Error Handling**
- Graceful degradation when VirusTotal API key is missing
- Rate limit detection and user-friendly error messages
- Partial success handling (returns successful scans even if some fail)

### Data Storage

**Current Implementation: In-Memory Storage**
- MemStorage class implements IStorage interface for scan results and user data
- No persistent database currently configured (data lost on server restart)
- UUID-based unique identifiers for all entities

**Database Schema (Drizzle ORM Ready)**
- Drizzle ORM configured for PostgreSQL with Neon Database support
- Schema defined in `shared/schema.ts`:
  - `users` table: id, username, password (authentication ready but not implemented)
  - `scan_results` table: id, indicator, type, status, detections, totalVendors, lastScanned, vendorResults (JSONB), rawResponse (JSONB)
- Migration-ready with `drizzle-kit` configured

**Storage Decision Rationale**
- In-memory storage chosen for prototype/development simplicity
- Database schema prepared for production deployment with persistent storage
- Drizzle ORM provides type-safe queries and automatic schema migrations

### External Dependencies

**VirusTotal API Integration**
- Primary threat intelligence provider
- Supports file hash lookups (MD5, SHA1, SHA256) and IP reputation checks
- Rate limit: 4 requests per minute on free tier
- API key required via `VIRUSTOTAL_API_KEY` environment variable
- Graceful error handling for rate limits and missing API keys

**Third-Party Services**
- Neon Database (@neondatabase/serverless): Serverless PostgreSQL for production deployment
- Google Fonts: Inter and JetBrains Mono font families
- Radix UI: Accessible component primitives

**Key NPM Packages**
- **Frontend**: @tanstack/react-query, wouter, react-hook-form, zod, date-fns, tailwindcss, clsx/tailwind-merge
- **Backend**: express, drizzle-orm, drizzle-zod
- **UI Components**: @radix-ui/* primitives, shadcn/ui components, lucide-react icons

**Development Tools**
- TypeScript for type safety across full stack
- Vite plugins: @replit/vite-plugin-runtime-error-modal, cartographer (Replit-specific)
- ESBuild for production server bundling
- PostCSS with Autoprefixer for CSS processing

### Security Considerations

**API Key Management**
- VirusTotal API key stored in environment variables (not committed to repo)
- Server-side API calls prevent key exposure to client

**Input Validation**
- Zod schemas validate all user inputs server-side
- Hash format validation (MD5/SHA1/SHA256 regex patterns)
- IP address format validation (IPv4 regex)
- Batch size limits (1-100 indicators per request)

**Session Management**
- User authentication schema defined but not actively implemented
- connect-pg-simple configured for PostgreSQL session storage (when database is added)