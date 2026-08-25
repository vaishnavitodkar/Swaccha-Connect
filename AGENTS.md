# Swachh Connect

## Project

Swachh Connect is a citizen-centric sanitation complaint portal.

The application allows citizens to:

- report sanitation issues
- upload photographs
- provide location
- discover nearby complaints
- support/vote on existing complaints
- track complaint progress
- verify completed cleaning
- participate in community cleanup drives

Municipality officers can:

- view complaints
- manage assigned complaints
- update complaint status
- upload before/after cleaning photographs
- manage resolution workflow

---

# Technology

Frontend:

- Next.js
- TypeScript
- Tailwind CSS

Backend:

- Supabase

Supabase is responsible for:

- Authentication
- PostgreSQL
- Storage
- Row Level Security
- Realtime

Do NOT create a separate backend.

Do NOT introduce FastAPI, Express, Prisma, Drizzle, or MongoDB unless explicitly requested.

---

# Supabase

The application uses an existing Supabase project.

Supabase is the source of truth for application data.

The existing database contains:

- profiles
- municipalities
- wards
- complaints
- complaint_images
- complaint_votes
- complaint_comments
- complaint_status_history
- cleanup_drives
- cleanup_volunteers
- notifications

Authentication uses:

auth.users

Application profile information uses:

public.profiles

The relationship is:

auth.users.id = profiles.id

---

# Authentication

Use Supabase Auth.

Do not implement custom authentication.

Users have one of these roles:

- citizen
- officer
- admin

The role is stored in:

public.profiles.role

Never trust a role supplied by the browser.

Authorization must be enforced using Supabase RLS.

---

# Complaint Lifecycle

The intended lifecycle is:

reported
→ acknowledged
→ assigned
→ scheduled
→ in_progress
→ completed
→ citizen_verification
→ closed

A complaint can be reopened after citizen verification:

citizen_verification
→ reopened
→ assigned

---

# Complaint Images

Images are stored in Supabase Storage.

Bucket:

complaint-images

Image types:

- report
- before
- after

Database metadata is stored in:

public.complaint_images

Do not store image binary data in PostgreSQL.

---

# Community

Citizens can:

- view nearby complaints
- vote on complaints
- comment
- join cleanup drives
- track issue resolution

Votes are stored in:

public.complaint_votes

A user may vote only once per complaint.

Cleanup drives use:

public.cleanup_drives

Volunteer registrations use:

public.cleanup_volunteers

---

# Security

Never:

- expose a Supabase service-role key
- disable RLS
- bypass RLS from browser code
- trust client-provided roles
- commit secrets

Use only:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

in browser-accessible code.

---

# Hackathon Constraints

Use synthetic/mock data.

Never use:

- real Aadhaar
- real PAN
- real OTPs
- real payment details
- real government credentials
- private government APIs

Do not access or interfere with live government systems.

Do not present the application as an official government product.

---

# Development Approach

Build the main journey first:

Citizen
→ report issue
→ upload image
→ submit complaint
→ municipality/officer
→ update status
→ cleaning evidence
→ citizen verification
→ close complaint

Do not build every feature simultaneously.

Prioritize a complete working journey over feature quantity.

---

# Before Changing Anything

1. Inspect the existing repository.
2. Reuse existing components and configuration.
3. Do not invent database tables.
4. Do not change the Supabase schema without explicit approval.
5. Do not disable RLS.
6. Do not introduce unnecessary dependencies.
7. Test changes after implementation.
