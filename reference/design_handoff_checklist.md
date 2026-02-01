# Design Handoff Checklist

This checklist ensures that all visual and interactive elements of the application are implemented consistently and correctly according to the design specifications.

---

## 1. Global Styles & Branding

- [ ] **Color Palette**: All primary, secondary, accent, background, and foreground colors are correctly implemented as CSS variables in `src/app/globals.css`.
- [ ] **Typography**: `Inter` and `Noto Sans Javanese` fonts are applied correctly for body, headlines, and specific elements. Font weights and sizes are consistent across the application.
- [ ] **Border Radius**: Consistent `var(--radius)` is used for all components (cards, buttons, inputs, etc.) to ensure uniform curvature.
- [ ] **Shadows**: Soft drop shadows on cards and other elevated elements are consistent and applied correctly for depth.
- [ ] **Spacing**: Consistent use of Tailwind's spacing scale for padding, margins, and gaps between elements to maintain a balanced layout.

## 2. Core Layouts

- [ ] **Main App Layout**: The primary layout (`dashboard`, `modules`, `profile`) with the sidebar, header, and main content area is structured correctly and consistently.
- [ ] **Admin Layout**: The admin-specific sidebar and layout are implemented and consistent across all pages within the `/admin` route.
- [ ] **Responsiveness**: All core layouts are fully responsive, providing a seamless experience on mobile, tablet, and desktop devices.

## 3. Component Library (ShadCN)

- [ ] **Buttons**: All variants (default, secondary, destructive, ghost, outline, link) are styled according to the active theme.
- [ ] **Cards**: Components like `Card`, `CardHeader`, `CardContent`, `CardTitle`, and `CardDescription` are used correctly with consistent padding, borders, and shadows.
- [ ] **Forms**: All form elements (`Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Switch`) have consistent styling and states (focus, disabled, etc.).
- [ ] **Sidebar**: The custom sidebar component is fully functional, including its expanded, collapsed (icon), and mobile (off-canvas) states.
- [ ] **Avatars**: Styled correctly with image and fallback states.
- [ ] **Badges**: All variants (default, secondary, outline, destructive) are styled and used appropriately.
- [ ] **Progress Bars**: Styled with the primary theme color fill and a secondary background.
- [ ] **Tables**: Consistent styling for headers, rows, and cells in all data tables.
- [ ] **Tooltips & Popovers**: Function as expected and are styled according to the theme.
- [ ] **Dialogs/Modals**: Used for actions like editing users, with consistent styling and behavior.

## 4. Theming

- [ ] **Theme Switcher (Dark/Light)**: The dark/light mode switcher is functional and correctly toggles the `.dark` class on the `<html>` element. All components adapt correctly to both themes.
- [ ] **Accent Color Themes (Profile Page)**: The accent color switcher on the profile page correctly applies the selected theme class (e.g., `theme-sky-blue`, `theme-original-purple`) to the `<html>` element, and all primary color accents update globally.

## 5. Page-Specific Design

- [ ] **Dashboard**: All cards (Progress, Streak, Active Modules, Word of the Day, Leaderboard) are designed and laid out according to the reference design.
- [ ] **Module List & Detail Pages**: The layout for listing all modules and the detailed view for a single module (with its lessons) matches the design.
- [ ] **Lesson Page**: All sections (Header, Dialogue, Vocabulary Table, Practice Section, Cultural Note) are styled and laid out correctly.
- [ ] **Profile Page**: The user information and theme selection cards are implemented as per the design specifications.
- [ ] **Admin Pages**: All admin CRUD pages (Modules, Lessons, Vocabulary, Users, Feedback) have a consistent and functional design, including tables, filters, and action buttons.
