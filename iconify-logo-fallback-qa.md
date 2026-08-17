# Iconify Logo Fallback QA

Date: 2026-08-17

The Google company tile was temporarily pointed to an invalid Iconify Simple Icons slug. The desktop and narrow mobile landing-page captures confirmed that the tile falls back to initials without breaking the dark company rail, spacing, or responsive containment. The real `google` slug was restored immediately after verification, so no test-only data remains in the product.

The logo rail uses public Iconify Simple Icons URLs with lazy loading and an `onError` fallback. The rail is framed as curriculum context and does not imply endorsement, partnership, or hiring guarantees.
