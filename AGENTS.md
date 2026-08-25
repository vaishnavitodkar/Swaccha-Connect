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

# UI Framework — UX4G

UX4G Web Components is the primary UI component library for this project.

Package:

ux4g-web-components

All application UI should use UX4G components wherever an appropriate component exists.

Before creating a custom UI component, check:

docs/UX4G_COMPONENTS.md

and the installed UX4G package.

## Component priority

Use:

1. UX4G Web Component
2. Existing project component built around UX4G
3. Small custom component only when UX4G does not provide the required functionality

Do NOT recreate existing UX4G components using raw HTML/CSS.

For example, prefer the UX4G:

- Button
- Input
- Select
- Checkbox
- Radio
- Alert
- Modal
- Card
- Navbar
- Table
- Pagination
- Badge
- Spinner
- etc.

when applicable.

## Styling

Do not introduce another UI component library.

Do not install:

- Bootstrap React
- Material UI
- Ant Design
- Chakra UI
- shadcn/ui

unless explicitly requested.

Do not replace UX4G with custom Tailwind components when an equivalent UX4G component exists.

Tailwind may be used for:

- page layout
- spacing
- responsive structure
- positioning
- application-specific layout

but UX4G should provide the actual UI controls whenever possible.

## UX4G documentation

The canonical local reference is:

docs/UX4G_COMPONENTS.md

When component behavior is unclear:

1. inspect the installed package
2. inspect its TypeScript definitions/source
3. inspect the official UX4G documentation if available

Do not invent UX4G component names, attributes, APIs, or events.

## Next.js

UX4G components must be integrated correctly with Next.js App Router.

If a UX4G component requires browser-side JavaScript:

- isolate it appropriately in a client component
- do not convert the entire application to client rendering unnecessarily

Keep server components server-side wherever possible.

## Accessibility

Prefer UX4G's built-in accessibility behavior.

Do not remove:

- labels
- keyboard navigation
- focus management
- semantic HTML
- accessible names
- ARIA attributes where required

## Responsive design

The application must work well on:

- mobile phones
- low-resolution screens
- tablets
- desktop

Prioritize mobile because many Indian citizens will access the service from mobile devices.