/**
 * Join YRC signup lives in Tally — https://tally.so/r/44Zrzb
 * The form is the source of truth; never recreate it as a custom form.
 * The popup is driven by the embed script loaded in the root layout
 * (https://tally.so/widgets/embed.js), which picks up the data-tally-*
 * attributes or intercepts links using the tally-open URL hash.
 */

export const TALLY_FORM_URL = "https://tally.so/r/44Zrzb";

/** Link-hash variant of the popup trigger, for plain <a href> CTAs. */
export const TALLY_POPUP_HASH =
  "#tally-open=44Zrzb&tally-width=500&tally-align-left=1&tally-overlay=1&tally-emoji-text=🏃‍➡️&tally-emoji-animation=none";

/** data-tally-* attributes for buttons/clickable elements. */
export const tallyPopupAttributes = {
  "data-tally-open": "44Zrzb",
  "data-tally-width": "500",
  "data-tally-align-left": "1",
  "data-tally-overlay": "1",
  "data-tally-emoji-text": "🏃‍➡️",
  "data-tally-emoji-animation": "none",
} as const;
