# SKILLS.MD — Agent Skills & Capabilities

This document outlines specialized skills and workflows available to AI agents working on the AyoSinau project.

---

## 1. Content Management Skills

### 1.1 Markdown Parsing & Lesson Creation
**Capability**: Parse markdown lesson files into structured database content

**When to use**:
- Adding new lessons from markdown files
- Updating lesson content from source files
- Bulk importing lesson content

**Key files**:
- `lib/markdown-parser.ts` - Parser utility
- `prisma/seed.ts` - Seeding implementation
- `reference/lesmateriaal/` - Source markdown files

**Process**:
1. Read markdown file from `reference/lesmateriaal/module-{n}-{name}/`
2. Parse using `parseMarkdownLesson()` to extract:
   - Description from `## 📜 Beschrijving`
   - Sections from other headings
   - Vocabulary from tables
   - Quiz references
3. Create/update lesson via DAL
4. Link vocabulary and quizzes

---

### 1.2 Block Editor Management
**Capability**: Manage lesson content through the block-based editor

**When to use**:
- Editing lesson structure
- Reordering content sections
- Adding/removing content blocks

**Key files**:
- `components/admin/LessonBlockEditor.tsx` - Main editor
- `components/admin/BlockEditorDialog.tsx` - Individual block editor
- `app/admin/actions.ts` - Server actions

**Available block types**:
- `MARKDOWN` - Rich text content with optional title
- `FLASHCARD_SET` - Vocabulary practice with word IDs
- `QUIZ_LINK` - Link to assessment quiz

---

### 1.3 Vocabulary Management
**Capability**: Bulk import, match, and manage vocabulary entries

**When to use**:
- Importing vocabulary from JSON files
- Auto-matching audio files to vocabulary
- Managing vocabulary metadata

**Key files**:
- `app/actions/admin.ts` - Bulk operations
- `dal/vocabulary.ts` - Data access layer
- `public/audio/uploads/` - Audio file storage

**Audio matching**:
- Automatic matching based on word similarity
- Supports various file naming patterns
- Handles diacritics and special characters

---

## 2. Database & Schema Skills

### 2.1 Prisma Migrations
**Capability**: Create and manage database schema changes

**When to use**:
- Adding new fields to models
- Creating new models
- Modifying relationships

**Process**:
1. Update `prisma/schema.prisma`
2. Run `npx prisma generate` to update client
3. Run `npx prisma migrate dev --name {description}` to create migration
4. Update DAL functions to use new fields
5. Update seed script if needed

**Important**:
- Always use descriptive migration names
- Test migrations on development database first
- Update TypeScript types after generating client

---

### 2.2 Data Seeding
**Capability**: Populate database with initial or test data

**When to use**:
- Setting up development environment
- Resetting database to known state
- Testing new features

**Key files**:
- `prisma/seed.ts` - Main seed script
- `reference/lesmateriaal/` - Source content

**Process**:
1. Ensure markdown files are in `reference/lesmateriaal/`
2. Run `npx prisma db seed`
3. Verify data in Prisma Studio

---

## 3. Admin Interface Skills

### 3.1 Publishing Workflow
**Capability**: Manage lesson and module publishing states

**When to use**:
- Controlling content visibility
- Previewing draft content
- Bulk publishing operations

**Key concepts**:
- `published: Boolean` field on Lesson model
- Preview mode via `?preview=true` query parameter
- Toggle publishing via admin UI

**Files**:
- `app/admin/actions.ts` - `toggleLessonPublishAction`
- `app/lessons/[slug]/page.tsx` - Preview mode handling
- `app/admin/AdminClient.tsx` - UI controls

---

### 3.2 Quiz Management
**Capability**: Create and edit quizzes with various question types

**When to use**:
- Creating assessments for lessons
- Editing quiz questions
- Managing quiz options

**Supported question types**:
- `MULTIPLE_CHOICE` - Standard MCQ
- `FILL_IN_BLANK` - Text input
- `AUDIO_STORY_MCQ` - Audio-based MCQ
- `MULTI_SELECT_AUDIO_WORDS` - Multiple audio selections
- `MATCH_PAIRS` - Matching exercise
- `REORDER_SENTENCE` - Word order practice

**Key files**:
- `components/admin/QuizQuestionEditor.tsx` - Question list editor
- `components/admin/QuestionItemEditor.tsx` - Individual question editor
- `components/quiz/QuizClient.tsx` - Student-facing quiz renderer

---

## 4. Development Workflows

### 4.1 Adding New Features
**Standard workflow**:
1. Create implementation plan in artifacts directory
2. Update `task.md` with subtasks
3. Implement changes following existing patterns
4. Test manually and via Prisma Studio
5. Create walkthrough documenting changes
6. Update AGENTS.MD if architecture changed

---

### 4.2 Debugging Content Issues
**Common issues and solutions**:

**Issue**: Lesson not displaying
- Check `published` status
- Verify `content.sections` structure
- Check for missing vocabulary IDs

**Issue**: Audio not playing
- Verify `audioUrl` field is set
- Check file exists in `public/audio/uploads/`
- Use "Auto-match Audio" in admin panel

**Issue**: Quiz not working
- Verify `questions` array structure
- Check `options` field matches question type
- Ensure `correctAnswer` is valid

---

## 5. Best Practices

### 5.1 Code Patterns
- **Always use DAL**: Never call Prisma directly outside `dal/`
- **Server Actions**: Validate with Zod, return typed results
- **Client Components**: Mark with `"use client"` only when needed
- **Imports**: Use `@/` alias for absolute imports

### 5.2 Content Patterns
- **Markdown headings**: Use emoji prefixes for visual hierarchy
- **Section order**: Logical flow (intro → content → practice → assessment)
- **Vocabulary**: Include context, examples, and formality level
- **Quizzes**: Mix question types for engagement

### 5.3 Admin UX Patterns
- **Modals**: Use for focused editing tasks
- **Full-screen editors**: Use for complex content (block editor)
- **Inline editing**: Avoid for structured content
- **Confirmation**: Always confirm destructive actions

---

## 6. Common Tasks Quick Reference

### Add a new lesson
1. Create markdown file in `reference/lesmateriaal/module-{n}-{name}/`
2. Add vocabulary JSON file if needed
3. Add quiz JSON file if needed
4. Run `npx prisma db seed`

### Update lesson content
1. Edit markdown file in `reference/lesmateriaal/`
2. Re-run seed script, or
3. Use block editor in admin panel

### Add new field to Lesson model
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_{field_name}`
3. Update `dal/lessons.ts` functions
4. Update admin UI to display/edit field
5. Update seed script if needed

### Bulk publish lessons
1. Open admin panel
2. Filter lessons by module or status
3. Click status badge to toggle individual lessons, or
4. Create bulk action in `app/admin/actions.ts`

---

This document should be updated as new skills and workflows are developed.
