# AGENTS.MD — Project Context, Rules & Guardrails

## 1. Project Overview
**Application**: AyoSinau — Javaans voor Nederlanders  
**Goal**: An interactive web application that helps Dutch speakers learn the Javanese language and culture through structured lessons, quizzes, flashcards, and pronunciation feedback.

**Primary UI & Content Language**: Dutch (Nederlands)  
**Code & Comments Language**: English  
**Codebase Root**: `d:\antigravity\ayosinau`

**Target Audience**:
- Beginners with no prior Javanese knowledge
- Dutch speakers
- Cultural and practical language focus (Ngoko first, others later)

---

## 2. Tech Stack (Definitive)
- **Framework**: Next.js (App Router, Server Components, Server Actions)
- **UI**: React, Tailwind CSS, ShadCN UI (customized design system)
- **Database**: Neon (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: **Provider-agnostic (TBD)** — the app must be structured so the auth provider can be swapped later (e.g., Supabase Auth, NextAuth, Clerk, Firebase Auth).
- **AI Integration**:
  - **Primary**: OpenAI (chat tutor, content assistance, structured outputs)
  - Optional/secondary: Genkit only if/when needed later (e.g., orchestration, TTS). Do not introduce Genkit-specific coupling by default.

⚠️ Do **not** introduce alternative frameworks, ORMs, package managers, or tightly-coupled auth frameworks without explicit instruction.

---

## 3. Package Manager & Tooling (Important)
**Preferred package manager**: **npm**

Rules:
- `package-lock.json` is authoritative
- `pnpm-lock.yaml` and other lockfiles must **not** exist
- All install, build, and test commands assume **npm**

---

## 4. Architectural Principles (Hard Rules)
- **Server-first architecture**
  - Prefer Server Components and Server Actions
  - Minimal client-side JavaScript
- **Single source of truth**
  - All database access goes through a centralized Data Access Layer (DAL)
- **Explicit over implicit**
  - Zod validation for all inputs
  - Typed return values for Server Actions
- **Small, incremental changes**
  - Avoid large refactors unless explicitly requested

---

## 5. Project Structure & Golden Paths
Key directories (authoritative):

- `app/`  
  Next.js routes, layouts, pages, and route-level Server Actions

- `components/`  
  Reusable UI components (mostly ShadCN-based)

- `lib/`  
  Utilities, helpers, validation schemas, shared logic

- `dal/`  
  **Centralized Data Access Layer**  
  - All Prisma queries live here  
  - No direct Prisma calls outside this folder

- `prisma/`  
  - `schema.prisma`  
  - migrations  
  - seed scripts

- `projects/`  
  Scripts and tools for:  
  - content generation  
  - seeding  
  - admin utilities

- `reference/`  
  Long-form documentation and project summaries

---

## 6. Domain Model & Terminology
Core domain concepts:
- **Module**: A themed learning unit (e.g. Pronunciation, Grammar)
- **Lesson**: A specific instructional unit within a module
- **Word**: Vocabulary item with pronunciation, formality, and metadata
- **Quiz**: Assessment linked to lessons and words
- **Flashcards**: Vocabulary review, client-side logic only

**Formality Levels** (examples):
- Ngoko
- Krama
- Krama Inggil

The Prisma schema (`prisma/schema.prisma`) is the authoritative definition.

---

## 7. Server Actions & API Conventions
- Naming:
  - `createXAction`
  - `updateXAction`
  - `deleteXAction`
- Always:
  - Validate input with Zod
  - Perform authorization checks server-side
  - Return typed results (no `any`)
- Errors:
  - Use controlled error messages
  - UI feedback via toast notifications
- Revalidation:
  - Use `revalidatePath` or `revalidateTag` explicitly

---

## 8. Authentication, Authorization & RBAC (Provider-Agnostic)
**Authentication is not chosen yet.** The codebase must keep auth behind a small interface so switching providers is low-cost.

### 8.1 Auth abstraction rules
- All auth provider logic must live behind a single boundary (e.g. `lib/auth/`), with a minimal public surface:
  - `getCurrentUser()` (server)
  - `requireUser()` / `requireRole()` / `requirePermission()` (server guards)
  - `signIn()` / `signOut()` wrappers (client usage only where unavoidable)
- Application code (Server Actions, DAL, pages) must not import provider SDKs directly.
- Store an internal, provider-neutral `User` shape used everywhere:
  - `id`, `email`, `role`, `permissions?`, `displayName?`
  - Any provider-specific IDs/claims should be mapped in the auth boundary.

### 8.2 RBAC model (roles + permissions)
Use a fine-grained RBAC model based on:
- **Roles**: e.g. `ADMIN`, `CONTENT_EDITOR`, `USER`
- **Permissions**: action strings like `module_add`, `module_delete`, `user_manage`
- **Permissions map**: a single mapping that assigns permissions to roles

**Single source of truth**:
- Keep permissions and role-to-permission mapping in one place (e.g. `lib/permissions.ts`).
- `ADMIN` can be treated as "all permissions".

### 8.3 Enforcement rules
- **Backend (Server Actions) enforcement is mandatory** for all sensitive operations.
- **Frontend (UI) checks** are allowed for UX (hide/disable actions) but must never be the only protection.

### 8.4 Path note
If existing docs mention paths like `src/lib/...`, align them to the actual repo layout (this project may be root-based without `src/`). Do not add a `src/` folder just to match documentation.

---

## 9. UI & Design Rules
- Use **ShadCN UI primitives** wherever possible
- Tailwind:
  - Mobile-first
  - Responsive by default
- **Accessibility**: Keyboard navigation (Space to flip, 1-4 to rate in Flashcards), focus states, and semantic HTML
- **Customization**: Global `ThemeProvider` for persistent accent colors and dark mode.
- Do not introduce new UI libraries without approval

---

## 10. Internationalization & Content Rules
- **UI text**: Dutch
- **Code & comments**: English
- Javanese content:
  - Stored in the database
  - Unicode-safe
  - Consistent transliteration
- Avoid hardcoded strings for reusable UI

---

## 11. Quality Gates & Tooling
Before changes are considered complete:
- TypeScript strict mode passes
- ESLint passes
- Prisma schema is valid
- Migrations are explicit and reviewed

Preferred commands:
- `npm run lint`
- `npm run typecheck`
- `npm run prisma:validate`
- `npm run prisma:migrate`

---

## 12. Environment & Configuration
- All secrets live in `.env`
- Required providers:
  - Neon
  - (Auth provider TBD)
  - OpenAI
- Never commit secrets
- Document new env vars when introduced

---

## 13. Agent-Specific Instructions (Very Important)
When acting as an agent on this project:

- Follow existing patterns before introducing new ones
- Prefer minimal diffs over rewrites
- Do **not** add dependencies without explicit instruction
- Never restructure folders unless asked
- Always surface:
  1. What you plan to change
  2. Which files are touched
  3. Why the change is needed
  4. Any risks or follow-up steps

Migrations, schema changes, or auth changes must always be clearly highlighted.

---

## 14. Content Architecture & Lesson Structure

### 14.1 Lesson Content Model
Lessons use a **modular, block-based content structure** stored as JSON in the database:

```typescript
{
  sections: [
    {
      id: string,
      type: 'MARKDOWN' | 'FLASHCARD_SET' | 'QUIZ_LINK' | 'CULTURAL_INSIGHT',
      order: number,
      content: {
        // MARKDOWN: { title?: string, markdownText: string }
        // FLASHCARD_SET: { title: string, wordIds: string[] }
        // QUIZ_LINK: { title: string, quizId?: string }
        // CULTURAL_INSIGHT: { title: string, content: string }
      }
    }
  ]
}
```

### 14.2 Markdown Source Files
- **Location**: `reference/lesmateriaal/module-{n}-{name}/`
- **Format**: Markdown files with structured headings
- **Parsing**: Automatic via `lib/markdown-parser.ts`

**Parsing Rules**:
- `## 📜 Beschrijving` → Extracted as `lesson.description`
- Each other `##` heading → Separate section
- `### 🌱 Samenvatting & Cultuurreflectie` → Cultural notes section
- Vocabulary tables → Auto-detected as `FLASHCARD_SET`
- Quiz references → Auto-detected as `QUIZ_LINK`

### 14.3 Admin Content Editing
- **Primary Interface**: Block Editor (`LessonBlockEditor`)
- **Access**: Via "Configure Blocks" button in lesson modal
- **Features**:
  - Drag-and-drop section reordering
  - Individual section editing
  - Type-specific editors (Markdown, Vocabulary, Quiz)
- **No Raw JSON**: The raw JSON textarea has been removed from the admin UI

### 14.4 Publishing Workflow
- **Draft State**: Lessons default to `published: false`
- **Preview Mode**: `?preview=true` query parameter bypasses published check
- **Publishing**: Toggle via status badge or checkbox in lesson modal
- **Auto-publish**: Seeded lessons are automatically published

---

## 15. Reference Documentation
- Project summary: `reference/project_summary.md`
- Content rendering guide: `reference/contentlessons/content_render_guide.md`
- Lesson editing guide: `reference/contentlessons/lesson-content-editing-guide.md`
- Additional docs: `reference/`
- Scripts & tools: `projects/`

This file is the **single source of truth** for agents and contributors.
