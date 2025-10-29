# Frontend Guidelines Document

# Frontend Guideline Document

This document describes the setup and best practices for the frontend of our web-based business finance tracker with an AI assistant. It’s written in everyday language so anyone can follow along.

## 1. Frontend Architecture

### Frameworks and Libraries

*   **Next.js (App Router)**: Our React framework of choice. It gives us file-based routing, server components, and API routes out of the box.
*   **TypeScript**: Adds type safety to catch errors early.
*   **Tailwind CSS + Shadcn UI**: A utility-first CSS framework with a ready-made component library. This speeds up styling and enforces consistency.

### How It Supports Our Goals

*   **Scalability**: Next.js scales from small prototypes to large apps. Server and client components let us offload heavy work to the server.
*   **Maintainability**: TypeScript plus clear folder conventions (pages, components, styles) make code easier to navigate and refactor.
*   **Performance**: Next.js does automatic code splitting and static optimization. Tailwind’s JIT mode ensures we only ship the CSS we use.

## 2. Design Principles

We follow these guiding principles:

*   **Usability**: Interfaces are simple and intuitive. Labels and buttons use plain language (e.g., “Add Expense” instead of “Submit Form”).
*   **Accessibility**: We use semantic HTML, proper ARIA attributes, and ensure color contrast meets WCAG 2.1 AA standards.
*   **Responsiveness**: Designs adapt fluidly from mobile phones to large desktop screens using Tailwind’s responsive utilities.
*   **Consistency**: Reuse the same spacing, typography, and interaction patterns everywhere.

How We Apply Them:

*   Buttons and inputs use shared components from Shadcn UI.
*   Forms validate input in real time, with clear error messages.
*   Navigation works via keyboard and screen readers.

## 3. Styling and Theming

### Approach and Methodology

*   We use **Tailwind CSS** for utility classes and **Shadcn UI** for polished components.
*   No separate SASS or BEM is needed—Tailwind’s naming covers most use cases.

### Theming

*   The entire app uses a **single theme** based on our green color palette (below).
*   We configure Tailwind’s `theme.extend` in `tailwind.config.js` to include our custom colors.

### Visual Style

*   **Style**: Modern flat design with subtle shadows for depth, minimal glassmorphism to keep focus on data.

*   **Color Palette**:

    *   Primary Green: #16A34A (used for buttons, links, highlights)
    *   Dark Green: #14532D (hover states, active elements)
    *   Soft Gray: #F3F4F6 (backgrounds)
    *   Dark Gray: #374151 (text)
    *   White: #FFFFFF (cards, modals)

*   **Typography**: We use **Inter** for all text—clean, modern, highly readable.

## 4. Component Structure

### Organization

`/src /components ← reusable pieces (buttons, inputs, modals) /atoms ← smallest building blocks /molecules ← combinations of atoms (form fields) /organisms ← larger UI sections (header, dashboard widgets) /app ← Next.js App Router files (page.tsx, layout.tsx) /styles ← global styles, Tailwind config`

### Reuse and Maintainability

*   Every component lives in its own folder with `.tsx`, `.test.tsx`, and optional `.css` (if needed).
*   Props are fully typed. Default props and story files help document usage.
*   This modular approach means we can swap or update one component without breaking unrelated code.

## 5. State Management

### Approach

*   **Local State**: For UI interactions we use React’s `useState` and `useReducer` inside components.
*   **Global State**: We use React’s Context API for shared data (e.g., authentication status, theme).
*   **Data Fetching & Caching**: We rely on **React Query** (TanStack Query) to fetch from our Next.js API routes, cache responses, and handle loading/error states.

### How It Works

1.  **Authentication Context** holds the user’s session token across pages.
2.  **React Query** hooks live in components to pull lists of expenses, income, and assets.
3.  Shared React Query cache ensures rapid navigation without repeated network calls.

## 6. Routing and Navigation

*   **Next.js App Router**: File-based routing under `/app`. For example, `/app/dashboard/page.tsx` becomes `/dashboard`.
*   **Dynamic Routes**: We handle any dynamic segments (e.g., `/expense/[id]/edit`) via bracketed filenames.
*   **Navigation Links**: We use Next’s `<Link>` component with Tailwind-styled Shadcn UI menu items.
*   **Layouts**: A top-level `layout.tsx` wraps all pages with header, sidebar, and footer, so we don’t repeat layout code.

## 7. Performance Optimization

*   **Code Splitting**: Next.js automatically splits code per page. For larger components (e.g., charts), we use dynamic imports (`next/dynamic`).
*   **Lazy Loading**: Charts and heavy data-visualization components load only when they appear in view.
*   **Image Optimization**: If we use images, we use Next.js `<Image>` for automatic resizing and lazy loading.
*   **Tailwind JIT**: Ensures only the CSS classes we actually use end up in the final bundle.

These optimizations speed up first load and keep our bundle size small.

## 8. Testing and Quality Assurance

### Unit Tests

*   **Jest** + **React Testing Library** for component testing.
*   Each component has tests for rendering, props, and user interactions.

### Integration Tests

*   We write tests that render multiple components together (e.g., a form inside a modal) to catch integration issues.

### End-to-End (E2E) Tests

*   **Cypress** for user flows: logging in, adding an expense, viewing the dashboard, exporting Excel.

### Linting and Formatting

*   **ESLint** with TypeScript rules to catch errors and enforce style.
*   **Prettier** for consistent code formatting.

### CI/CD Checks

*   On every pull request, we run lint, type checks, unit tests, and E2E tests to ensure we stay green.

## 9. Conclusion and Overall Summary

We’ve laid out a clear frontend setup:

*   Next.js + TypeScript for structure and type safety
*   Tailwind CSS + Shadcn UI for rapid, consistent styling
*   React Query and Context for robust state handling
*   Jest, React Testing Library, and Cypress for rock-solid quality

These guidelines help us deliver a fast, maintainable, and user-friendly finance tracker that aligns with our green theme and AI-powered data entry vision. If you follow these principles and structure, you’ll keep the codebase healthy and the user experience top-notch.


---
**Document Details**
- **Project ID**: ec473bf4-ddb2-4ff4-8740-6df58f387758
- **Document ID**: 5b9c7543-82a4-4562-9bd2-de03cc2dcab1
- **Type**: custom
- **Custom Type**: frontend_guidelines_document
- **Status**: completed
- **Generated On**: 2025-10-02T11:35:04.142Z
- **Last Updated**: 2025-10-02T11:40:53.602Z
