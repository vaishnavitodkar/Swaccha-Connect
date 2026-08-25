# UX4G component reference

Verified against the installed `ux4g-web-components` **1.0.13** package. This is a CSS-class design system with an optional browser runtime. Despite its package name, it does **not** expose custom-element tags (for example, no `<ux4g-button>`) or React component imports. Use semantic native HTML elements plus UX4G classes.

> **Package/API mismatch:** the project requirement refers to a Custom Elements API, but the installed `1.0.13` artifact contains no `customElements.define(...)` calls, element classes extending `HTMLElement`, component-tag TypeScript definitions, or per-component exports. Its package metadata explicitly describes CSS classes used directly in HTML/React. Do not replace the current documented CSS integration with guessed tags or attributes. To adopt a Custom Elements API, first provide or approve the exact UX4G package/version that contains those registered elements and its documentation.

## Imports and Next.js App Router integration

| Purpose | Exact import |
| --- | --- |
| Global CSS bundle | `import 'ux4g-web-components/styles.css'` |
| Runtime auto-bootstrap (side effect) | `import 'ux4g-web-components/design-system'` |
| Explicit runtime control | `import { initRuntime, destroyRuntime } from 'ux4g-web-components/runtime'` |
| Type-safe class-name builders | `import { buildButtonClasses /* etc. */ } from 'ux4g-web-components/types'` |

Import the CSS once from `app/layout.tsx` or the existing global stylesheet. The bundle includes reset, tokens, dark theme, embedded fonts/icons, utilities, components, patterns, layout, and cascade fixes; do not manually reorder its internal layers.

The runtime injects browser scripts and sets up a `MutationObserver`. Keep it in a small client-only provider/component (or dynamically import the runtime from a `useEffect`); do not make the root layout or server-rendered pages client components just for UX4G. The runtime guards `window`/`document`, but isolating it makes the server/client boundary explicit. It has a singleton guard and is safe to initialise once. Use it for interactive UX4G markup; CSS-only components do not need it.

No component-specific import paths exist. The package exposes only the four paths above. Its `types` entry provides helpers that produce class strings; it does not provide JSX components or prop interfaces.

## Component inventory

The package README describes 52 CSS components. Primary classes and supported variants are below; use normal native element attributes (`disabled`, `name`, `type`, `required`, `aria-*`, etc.) rather than invented UX4G props.

| Area | Components / primary classes |
| --- | --- |
| Actions | Button: `ux4g-btn-{primary,outline-primary,tonal-primary,text-primary,danger,outline-danger,text-danger,outline-neutral,text-neutral}` + `ux4g-btn-{xl,lg,md,sm,xs}`; icon button: `ux4g-icon-btn ux4g-icon-btn-{primary,outline-primary,tonal-primary,text-primary}` + same size scale; link: `ux4g-text-link-{sm,md}` / `ux4g-text-link-neutral-{sm,md}` |
| Form controls | Input: `ux4g-input-container ux4g-input-{sm,md,lg,xl} ux4g-input-{default,error,success,warning}`; checkbox/radio/switch: `ux4g-{checkbox,radio,switch}` with their documented input/control/content child classes and sizes; native select `ux4g-form-select`; custom select `ux4g-select`; dropdown and combobox; textarea, search, slider, date/time picker, OTP, file upload, form-field group |
| Containers / content | Card (`ux4g-card ux4g-card-{solid,outline,no-fill} ux4g-card-{vertical,horizontal}`), image/ratio, avatar, badge, chip/chips group, tag, divider, breadcrumb, list, result list, empty state, feedback, draft status |
| Dialogs / disclosure | Modal, alert/context alert, accordion, tab, drawer, tooltip, popover, dropdown, carousel, mega menu |
| Navigation / sequence | Navbar, footer, pagination, stepper, journey timeline, status pipeline, time slot, social link |
| Data / status | Table, spinner, progress indicator, SLA progress indicator |
| Other | Accessibility bar and utility classes for typography, colour, layout, spacing, sizing, position, visibility and interaction |

For the complete valid value sets, import the package type helpers rather than hard-coding a guessed string. Examples include `buildButtonClasses`, `buildInputContainerClasses`, `buildDropdownClasses`, `buildModalBackdropClasses`, `buildTableClasses`, `buildStepperClasses`, `buildFileUploadClasses`, and `buildProgressIndicatorClasses` from `ux4g-web-components/types`.

## Forms

UX4G styles real form controls. Preserve their native semantics and bind standard React events (`onChange`, `onInput`, `onBlur`, `onSubmit`).

| Control | Required structure / available state |
| --- | --- |
| Input | Wrapper `ux4g-input-container`; include a real `<label>` associated with the input and use `ux4g-input-helper` for help/error text. Size: `sm/md/lg/xl`; state: `default/error/success/warning`. |
| Checkbox | `<label class="ux4g-checkbox ux4g-checkbox-md">` containing `input.ux4g-checkbox-input`, visual control, and `ux4g-checkbox-content`; `sm/md/lg`, optional `ux4g-checkbox-error`. |
| Radio | Same pattern with `input.ux4g-radio-input`, shared native `name`, `ux4g-radio-control`, and `ux4g-radio-content`; `sm/md/lg`, optional error state. |
| Switch | Use a native checkbox `input.ux4g-switch-input` with `role="switch"`; sizes `sm/md/lg`. |
| Custom select | `ux4g-select` wraps a real `select.ux4g-select-native`; its `option`s remain the source of truth. Supports `ux4g-select-single` or `ux4g-select-multi` and `sm/md/lg`. The runtime creates the visual menu and dispatches bubbling native `change` (and, for single selection, `input`) events on the native select. |
| Dropdown / combobox | Dropdown supports `selection/button/overflow`, `single/multi`, `sm/md/lg`, and `default/error/success/warning`. The documented control uses `button.ux4g-dropdown-control` with `aria-expanded`; this is a UI menu, not a form value by itself. |
| File upload | `ux4g-upload` with a real `input[type=file]`; documented states: `default`, `default-vle`, `selecting`, `scanning`, `uploaded`, `uploaded-vle`, `error`. The application still owns validation, previews, and upload handling. |

Do not use the package's Aadhaar/PAN example patterns in this project: the project rules prohibit real Aadhaar/PAN data.

## Dialogs, alerts, navigation, tables, and loading

| Need | Actual UX4G API |
| --- | --- |
| Modal | Trigger `data-modal-target="#id"`; target uses `ux4g-modal-backdrop` plus backdrop class `25/50/75/blur`, contains `ux4g-modal-box ux4g-modal-{s,m,l}`; close control uses `data-close-modal`. Supply `role="dialog"`, `aria-modal="true"`, a labelled title, and suitable focus behaviour. |
| Drawer | Trigger `data-drawer="id"`; panel `#id.ux4g-drawer.ux4g-drawer-{right,left,top,bottom}` inside `ux4g-drawer-overlay`; close control `data-drawer-close`. |
| Alert / notification | `ux4g-alert` or `ux4g-context-alert` + `ux4g-alert-{info,success,warning,error}`; close button `ux4g-alert-close`; positional classes `ux4g-alert-{top,bottom}-{left,right}`. Use `role="status"` or `role="alert"` as appropriate—these roles are not supplied automatically by the class. |
| Accordion / tabs | Accordion has `ux4g-accordion`, `ux4g-accordion__item`, `ux4g-accordion__header`, `ux4g-accordion__body`, and `data-ux4g-accordion-toggle`; variants include `arrow-right/arrow-left` and `bordered`. Tabs support `ux4g-tab`, `underline/pill`, `sm/md/lg`, and `vertical`. Runtime required for behaviour. |
| Navbar / page nav | Navbar: `ux4g-navbar`, `ux4g-navbar-wrap`, `ux4g-navbar-logo`, `ux4g-navbar-links`, `ux4g-navbar-right`, with `ux4g-navbar-desktop` and `ux4g-navbar-mobile`. Breadcrumb, pagination, footer, stepper and status pipeline are also CSS-markup components. |
| Table | Use a semantic `<table>` with `ux4g-table ux4g-table-{s,m,lg}`. Optional `ux4g-table-column-dividers`, `ux4g-table-no-row-dividers`, `ux4g-table-zebra-{rows,cols}`, `ux4g-table-interactive`, `ux4g-table-sortable`, `ux4g-table-header-brand`. Sorting/pagination data logic remains application code. |
| Loading / progress | Spinner: `ux4g-spinner-{primary,inverse,danger}-{full,split,partial}` plus optional size `xl/lg/sm/xs`; add `role="status"` and an accessible name. Progress uses `ux4g-progress-bar` and child `ux4g-progress-bar-fill`; a circular option and SLA progress indicator are also included. Set the visual percent from application state and expose it accessibly. |

## Runtime behaviour and events

The runtime is browser-only and performs delegated click/keyboard handling for interactive components (dropdowns, accordions/collapse, drawers/offcanvas, modal, tooltip, popover, toast, carousel, tabs, scrollspy, custom select, and related controls). It mutates classes/ARIA values, handles Escape in supported controls, locks body scrolling for overlays, and reinitialises UX4G after DOM mutations.

It does not publish a documented React event API or a set of named `onUx4g…` props. Attach normal React handlers to the native controls. Native form events work normally; the custom select explicitly emits bubbling `change`/`input` events. For application state changes (modal open state, pagination, table sorting, uploads), retain React state and standard handlers rather than relying on undocumented runtime internals.

## Accessibility and responsive guidance

- The CSS bundle supplies a global `:focus-visible` outline and reduced-motion styles. Runtime code includes keyboard handling for custom selects (Enter/Space, arrows, Escape) and uses ARIA state such as `aria-expanded`, `aria-selected`, and `aria-checked`.
- UX4G does not replace semantic authoring. Use real `<button>`, `<input>`, `<label>`, `<nav>`, `<table>`, headings, alt text, required/invalid descriptions, and accessible names for icon-only buttons and spinners.
- Modal and drawer examples supply dialog-related attributes but the application must provide an accessible label/title and verify focus behaviour in the rendered page.
- The CSS includes mobile/tablet/desktop media rules, including common boundaries around 320–767px, 768–1024px, and 1440px; the navbar provides explicit desktop/mobile classes. Responsive layout remains the page author's responsibility—use UX4G layout utilities or Tailwind only for layout/spacing around UX4G controls.
- Dark theme tokens activate on the root element with `data-theme="dark"` (`:root[data-theme="dark"]`).

## Compatibility notes

- Compatible with React by using `className` and native attributes/events. The README includes React examples with this approach.
- Compatible with Next.js App Router when CSS is globally imported and browser runtime loading is isolated to a client boundary.
- The runtime bundle is side-effectful and injects inline scripts. Load it once; use `destroyRuntime()` only if a client wrapper must intentionally tear it down.
- The package CSS bundle is approximately 8 MB according to its README (fonts are embedded). Account for this global client asset when evaluating performance.

## Sources inspected

- `node_modules/ux4g-web-components/package.json`
- `node_modules/ux4g-web-components/README.md`
- `node_modules/ux4g-web-components/dist/types/types.d.ts`
- `node_modules/ux4g-web-components/dist/runtime/index.d.ts` and runtime source
- `node_modules/ux4g-web-components/styles/ux4g.css`
