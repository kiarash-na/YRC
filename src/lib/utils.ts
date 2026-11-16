import { createCn } from "cn/config";

/**
 * Project `cn` — clsx + tailwind-merge semantics, configured for the YRC
 * type scale. ALWAYS import cn from here, never from the "cn" package
 * directly (enforced by eslint `no-restricted-imports`).
 *
 * Why: the custom font-size tokens from globals.css (text-hero, text-display,
 * text-h1 … text-caption) look like color utilities to the stock merger, so
 * `cn("text-h1", "text-yrc-accent")` silently DROPPED the size, and
 * `cn("text-sm", "text-h4")` kept both. Registering them as font-size fixes
 * both. Keep this list in step with the `--text-*` tokens in globals.css.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "hero",
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "body",
            "body-small",
            "caption",
          ],
        },
      ],
    },
  },
});
