# Brand logo fallback QA

## Scope
The Google company logo domain was temporarily changed to `invalid.blackvault.example` to force the Hunter logo request to fail. The source was then inspected through full-page screenshots at desktop (1280×720) and mobile (390×844) widths.

## Findings
The landing page remained contained and readable at both breakpoints while the failed logo tile preserved its layout and displayed its initials fallback instead of collapsing or showing a broken-image icon. The remaining verified domains continued to render in their logo frames. The temporary invalid domain must be restored before the final checkpoint.

## Boundary
This verifies the UI fallback path, not Hunter service availability or a production CDN cache. The product does not imply endorsement by displayed universities or companies.
