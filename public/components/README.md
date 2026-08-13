# Dashboard components

RoSignal is being migrated away from one monolithic `index.html` incrementally. The existing application logic in `public/app.js` still queries many DOM nodes at module load time, so view extraction has a strict contract until that JavaScript is modularized too.

## Extraction contract

1. Extract one self-contained view at a time.
2. Preserve every DOM `id`, `data-*` hook, accessibility relationship, and class that existing behavior depends on.
3. Replace the old view markup in `index.html` with exactly one component slot in the same change that wires the component.
4. Load and mount the component before `app.js` executes. Do not use asynchronous mounting for views that `app.js` queries at startup.
5. Never keep both the old markup and a mounted copy. Duplicate IDs are a correctness bug, not a migration strategy.
6. Add or extend `scripts/test-ui-component-boundaries.mjs` for each extracted boundary.
7. Keep backend and API behavior out of view-extraction changes unless the feature requires a separate reviewed change.

## Current structure

- `component-runtime.js` owns the product-view registry, navigation grouping, first-run routing, and the component mounting primitive.
- `template-runtime.js` converts trusted static template markup into mounted DOM.
- `connect-view-template.js` owns the extracted Setup / Connect view.
- `product-flow.css` owns styles that exist specifically for the guided dashboard flow.

## Product-view registry

`PRODUCT_VIEWS` in `component-runtime.js` is the source of truth for task labels, navigation section, whether a view requires a connected game, and any flow-specific page copy. Add flow metadata there instead of creating another independent list.

## Next extraction

Prefer a view with a clean behavioral boundary. Identify its startup DOM queries in `app.js`, preserve those hooks in the template, wire the slot synchronously, and run `npm run test:ui` before extracting the next view.
