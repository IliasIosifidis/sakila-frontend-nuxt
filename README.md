# Sakila Film Catalog — Frontend

Nuxt 4 frontend for the [Sakila Film Catalog](https://github.com/Iliaslosifidis/SpringBootExcercise) project. A two-column film browser with full-text search, autocomplete, faceted filtering, and inline editing.

**Live demo:** https://sakila-frontend-production.up.railway.app
**Backend API:** https://springbootexcercise-production.up.railway.app
**Backend repo:** https://github.com/Iliaslosifidis/SpringBootExcercise

---

## Screenshots

> 1. Landing page with films
loaded<img width="1598" height="1836" alt="Screenshot 2026-05-03 185620" src="https://github.com/user-attachments/assets/9eb38a77-a2eb-45ae-8318-92fba7c1c178" />

> 2. Search dropdown showing autocomplete
<img width="1330" height="338" alt="Screenshot 2026-05-03 185332" src="https://github.com/user-attachments/assets/38ddd5f3-92aa-4a67-b448-5de58af8911d" />

> 3. Filter sidebar with multiple filters applied
<img width="1734" height="1149" alt="Screenshot 2026-05-03 185250" src="https://github.com/user-attachments/assets/75b13129-1c12-4ca7-99c2-fd709752282a" />

> 4. Detail modal open on a film<img width="1206" height="584" alt="Screenshot 2026-05-03 185816" src="https://github.com/user-attachments/assets/c338363c-9fb2-4016-924e-9d90a4f83973" />

> 5. Edit mode in modal
> 6. <img width="1228" height="929" alt="Screenshot 2026-05-03 185822" src="https://github.com/user-attachments/assets/68d88220-3055-4636-8ff5-036eb409311b" />


---

## Features

- **Search-as-you-type autocomplete** (debounced at 250ms, queries the backend's edge n-gram autocomplete endpoint)
- **Full-text search** across film title and description, with relevance ranking
- **Faceted filtering** — language, multi-select rating, price bracket, length bracket. All filters compose with the search query in a single API call.
- **Pagination** of search/filter results
- **Detail modal** with view/edit modes for film title, description, and rental rate
- **Delete** with confirmation (most films will fail with backend FK constraint errors — this is intentional, demonstrating real-world referential integrity)

---

## Tech Stack

- Nuxt 4 (Vue 3, SSR)
- Pinia for state management
- Nuxt UI for component primitives
- Tailwind CSS v4 for styling
- VueUse (`watchDebounced`, `onClickOutside`)
- Axios for HTTP
- TypeScript
- Deployed on Railway

---

## Architecture

The frontend follows a presentational-component-with-store-driven-state pattern: `app.vue` reads state from a single Pinia store (`stores/films.ts`) and dispatches actions, while the store owns all data fetching, filter state, modal state, and pagination state. Components are kept stateless where possible.

A single Axios instance is lazily initialized using Nuxt's runtime config so the API base URL can be set per environment via the `NUXT_PUBLIC_API_BASE` environment variable.

---

## Running Locally

Prerequisites: Node.js 22+, the [backend API](https://github.com/Iliaslosifidis/SpringBootExcercise) running on `localhost:8080`.

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`. By default it calls the API at `http://localhost:8080/api/film`. Override via `NUXT_PUBLIC_API_BASE` env var.

---

## Building for Production

```bash
npm run build
node .output/server/index.mjs
```

A `Dockerfile` is included for containerized deployment. See the parent project's README for the full deployment story.

---

## Notable Implementation Details

**Debounced autocomplete.** The search input watches `store.searchQuery` via `watchDebounced` with a 250ms delay, preventing keystroke-by-keystroke API calls. The backend autocomplete endpoint returns up to 5 matches based on edge n-gram prefix matching.

**Optimistic updates.** After successful edit/delete operations, the local films array is patched directly rather than re-fetching from Elasticsearch. This avoids the eventual-consistency window where ES hasn't yet caught up to MySQL writes.

**Click-outside dropdown dismissal.** The autocomplete dropdown closes when the user clicks anywhere outside the search container, via VueUse's `onClickOutside`.

**Custom modal over Nuxt UI's `<UModal>`.** Initial implementation used Nuxt UI's modal component, which had reactivity binding issues with Pinia store properties. Replaced with a hand-rolled modal using `@click.self` for backdrop dismissal — fewer abstractions, full styling control.

**CORS-aware deployment.** The backend's CORS config explicitly allows the deployed frontend's origin and `localhost:3000` for development.

---

## Known Limitations

- Browser-native `confirm()` dialog for delete — visually inconsistent with the rest of the design. A custom confirmation modal would be a polish improvement.
- Languages dropdown is hardcoded for the demo. In a production system this would fetch from `/api/language`.
- DTOs typed as `any` rather than full TypeScript interfaces. Adding proper interfaces mirroring the backend's `FilmDto` and `FilmDocument` would improve developer experience.
