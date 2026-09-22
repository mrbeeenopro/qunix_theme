# Qunix Theme — Developer Guide

> **Extension ID:** `dev_qunix_theme`  
> **Version:** 1.4.x  
> **Stack:** Rust (backend) · React/TSX (frontend) · Vite · Mantine UI

---

## Folder Tree

```
backend-extensions/dev_qunix_theme/
├── Cargo.toml               # Rust crate manifest
├── Metadata.toml            # Extension metadata (id, version, name)
├── DEVELOPER.md             # This file
├── migrations/              # SQL migrations for extension-specific tables
├── src/
│   ├── lib.rs               # Extension entry point (registers routes, settings)
│   ├── settings.rs          # Serde structs for all saved settings (source of truth)
│   └── routes/              # Axum route handlers (settings CRUD, asset proxying)
└── frontend/
    └── src/
        ├── index.tsx                    # Main extension entry — all DOM enhancement hooks
        ├── AdminSettingsPage.tsx        # Settings page shell, tabs, form state
        ├── ConfigurationPage.tsx        # Per-server config page
        ├── app.css                      # Entry CSS import list
        ├── lib/
        │   └── schemas.ts              # Zod schema for all settings (validates form)
        ├── components/
        │   ├── settings/
        │   │   ├── SidebarSettings.tsx       # Sidebar style/radius/icon options
        │   │   ├── LoginLayoutSettings.tsx   # Login page layout picker
        │   │   ├── LayoutSettings.tsx        # Dashboard layout (floating, pill, etc.)
        │   │   ├── ColorsSettings.tsx        # Color pickers for theme tokens
        │   │   ├── StylingsSettings.tsx      # Border radius, shadow, spacing sliders
        │   │   ├── BannersSettings.tsx       # Egg banner image mapping
        │   │   ├── AnnouncementSettings.tsx  # Announcement bar config
        │   │   ├── AdvancedSettings.tsx      # Advanced/experimental options
        │   │   ├── ColorField.tsx            # Reusable color input component
        │   │   ├── IconList.ts               # Icon mapping registry (name → pack icon)
        │   │   └── colorUtils.ts             # HSL/hex conversion helpers
        │   └── theme/
        │       └── DynamicIcon.tsx           # Icon renderer (heroicons/mdi/lucide/lineicons)
        └── styles/
            ├── components/
            │   ├── variables.css       # All CSS custom properties (design tokens)
            │   ├── global.css          # Base resets, wallpaper img, scrollbars
            │   ├── sidebar.css         # Sidebar layout + hover styles (style-1 to style-4)
            │   ├── surfaces.css        # Cards, modals, inputs, header, AppShell
            │   ├── login.css           # Login page layout modes (CSS-driven by data-attrs)
            │   ├── banners.css         # Egg banner card styles
            │   ├── announcement.css    # Announcement bar
            │   └── toast.css           # Toast notifications
            └── admin/
                ├── layout.css          # Admin panel layout overrides
                ├── inputs.css          # Admin-specific input styles
                └── popover.css         # Dropdown / popover styles
```

---

## Architecture Overview

### Settings Flow

```
Rust settings.rs (saved to DB)
    ↓  API response JSON
AdminSettingsPage.tsx (Zod-validated form state)
    ↓  PATCH /api/extension/qunix/settings
Rust route handler saves → dispatches qunix-settings-loaded CustomEvent
    ↓  window event
index.tsx hooks → update CSS variables on <html> + inject DOM elements
    ↓
variables.css → styles pick up new values immediately
```

### CSS Variable System

All theme values are set as CSS custom properties on `:root` in `variables.css`.
Runtime JS in `index.tsx` overrides them via `root.style.setProperty(...)`.

**Naming:** `--ds-<component>-<property>`

| Variable | Purpose |
|---|---|
| `--ds-sidebar-radius` | Sidebar item border-radius |
| `--ds-sidebar-active-color` | Active item text color |
| `--ds-card-bg` | Card background |
| `--ds-wallpaper-blur` | Wallpaper blur amount |
| `--ds-sidebar-blur-active` | Glass blur value (`none` or `blur(Xpx)`) |

### DOM Enhancement Pattern

`index.tsx` exports React components that return `null` — they run DOM logic via `useEffect`:

| Component | Purpose |
|---|---|
| `QunixGlobalThemeEnhancer` | Replaces FontAwesome SVGs with custom icon pack SVGs |
| `QunixThemeLoader` | Root — sets all CSS variables, manages wallpaper `<img>`, and dynamically applies auth page enhancements |

### Dynamic Rendering & Event Integration

To apply custom themes/banners to elements loaded dynamically or outside of the default React Query cache (e.g., grouped servers):
1. **Server Registration**: Any server component wrapper (e.g., `QunixServerItemWrapper` in [DashboardLayout.tsx](file:///root/calagopus-panel/backend-extensions/dev_qunix_theme/frontend/src/components/theme/DashboardLayout.tsx)) registers its server object in the global lookup map `(window as any).qunixRenderedServersMap`.
2. **Event Notification**: Upon mount or update, the wrapper component dispatches a custom `'qunix-server-rendered'` window event.
3. **Event Listener**: The banner applier in [index.tsx](file:///root/calagopus-panel/backend-extensions/dev_qunix_theme/frontend/src/index.tsx) listens to `'qunix-server-rendered'` and runs `applyBanners()`. This event-driven lookup avoids expensive `subtree: true` DOM mutations, keeping rendering O(1) and performance high.

---

## How to Add a New Setting

1. **`src/settings.rs`** — add field to the Serde struct
2. **`src/lib/schemas.ts`** — add to Zod schema
3. **Settings component** — add form control (TextInput, Slider, etc.)
4. **`index.tsx` `QunixThemeLoader`** — read setting and call `root.style.setProperty('--ds-my-var', value)`
5. **CSS** — use `var(--ds-my-var)` in the relevant stylesheet

---

## How to Add a New Login Layout

Login layouts are **CSS-only** — JS sets `data-login-layout="<value>"` on `<html>`.

1. **`styles/components/login.css`** — add selector block:
   ```css
   html[data-login-layout="my-layout"].qunix-auth-active .h-screen { ... }
   html[data-login-layout="my-layout"] #qunix-login-banner { ... }
   ```

2. **`index.tsx`** — if it uses a banner, add `'my-layout'` to both `hasBanner` arrays (search for `hasBanner`).
   If the banner is a full-screen sibling (like `side-banner`), also add it to the placement condition:
   ```ts
   if (loginLayout === 'side-banner' || loginLayout === 'side-banner-inverted' || loginLayout === 'my-layout')
   ```

3. **`LoginLayoutSettings.tsx`** — add to the `LOGIN_LAYOUTS` array with `value`, `label`, `description`, and an SVG thumbnail.

---

## How to Add a New Sidebar Hover Style

1. **`styles/components/sidebar.css`** — add a `html[data-sidebar-hover-style="style-N"]` block.
   > **CRITICAL:** Never hardcode a px fallback on `border-radius`. Use only:
   > ```css
   > border-radius: var(--ds-sidebar-radius) !important;
   > ```
   > A hardcoded fallback (e.g., `var(--ds-sidebar-radius, 8px)`) silently overrides the user's radius slider.

2. **`SidebarSettings.tsx`** — add `{ value: 'style-N', label: '...' }` to the hover style options array.

---

## Build & Apply

```bash
SQLX_OFFLINE=true cargo run --bin panel-rs -- extensions apply --profile dev
```

Compiles Rust, builds Vite frontend, bundles into the panel binary.  
**Build time:** ~4 min (incremental: ~1 min)

---

## Performance Rules

| Rule | Reason |
|---|---|
| No `setInterval` polling | Runs forever even when nothing changes |
| `MutationObserver` — narrow scope, never `body + subtree:true` | Fires on every DOM mutation across the entire page |
| Debounce observer callbacks (150–200ms) | Prevents rapid-fire during React re-renders |
| Throttle `mousemove` with `requestAnimationFrame` | `getBoundingClientRect()` forces layout — max once per frame |
| `backdrop-filter` only under `body.has-bg-image` | Very expensive when applied to many elements simultaneously |
| Wallpaper via `#qunix-wallpaper-img` `<img>` | Static `<img>` is pre-composited once; never repaints on scroll |
| No `filter:blur()` on pseudo-elements | Forces full-viewport repaint on every scroll tick |

## CSS Conventions

- Sidebar styles: use `var(--ds-sidebar-radius)` and `var(--ds-sidebar-active-radius)` — **no hardcoded px fallbacks**
- Use `contain: paint` on card-level elements to isolate their repaints from siblings
- Use `contain: strict` on static fixed-position overlay elements (wallpaper img)
- Prefix all injected DOM element IDs with `qunix-` to avoid collisions with the base panel
