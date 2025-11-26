# Barangay Information System (BIS)

A comprehensive information system designed for efficient data management, fast retrieval, and secure operations for barangay administration.

## Features

1. **Resident Information Module** - Manage resident profiles with complete demographic data
2. **Barangay Document Issuance** - Generate certificates (Indigency, Residency, Clearance, etc.)
3. **Household Profiling** - Group residents by household with location tracking
4. **Incident and Case Reporting** - Log and track incidents and complaints
5. **Barangay Projects & Programs** - Manage ongoing and completed projects
6. **Barangay Officials & Employee Directory** - Track officials and staff
7. **Barangay Blotter System** - Log and track blotter entries
8. **Financial & Budget Management** - Manage budget, expenses, and allocations
9. **Activity & Announcement Board** - Post announcements and events
10. **Disaster & Emergency Response Module** - Track disasters and relief distribution
11. **Inventory Management** - Track equipment and supplies with QR codes
12. **Audit Trail & User Access Control** - Role-based access with activity logs

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Storage**: Local (configurable for cloud)

## Project Structure

```
BIS/
├── frontend/          # Next.js frontend application
├── backend/           # Express backend API
├── docs/              # Documentation
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Configure database and JWT secrets

4. Set up the database:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. Run the development servers:
   ```bash
   npm run dev
   ```

## Deployment

See `docs/DEPLOYMENT.md` for detailed deployment instructions for Vercel (frontend) and Render/Supabase (backend).

## Documentation

- API Documentation: `docs/API.md`
- Database Schema: `docs/SCHEMA.md`
- ER Diagram: `docs/ER_DIAGRAM.md`

## License

MIT



