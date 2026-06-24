/**
 * WHAT: Single source of truth for all magic numbers and strings in the app
 * WHY:  Eliminates "magic number" code smell — every numeric/string constant
 *       now has a name that explains WHY that value exists, not just what it is
 * HOW:  Import specific constants by name. UPPER_SNAKE naming per ai-instructions.
 *       Group by domain for easy discovery.
 */

// ---------------------------------------------------------------------------
// Validation limits
// ---------------------------------------------------------------------------

/** Maximum characters allowed in cart item special instructions (enforced in useCartStore) */
export const MAX_SPECIAL_INSTRUCTIONS_LENGTH = 100

/** Maximum characters in a feedback comment (enforced via Zod schema in FeedbackModal) */
export const MAX_FEEDBACK_COMMENT_LENGTH = 500

/** Maximum allowed feedback photo size in bytes (5 MB) */
export const MAX_FEEDBACK_PHOTO_BYTES = 5 * 1024 * 1024

// ---------------------------------------------------------------------------
// Network / retry
// ---------------------------------------------------------------------------

/** Number of retry attempts before surfacing an error to the user */
export const MAX_RETRY_ATTEMPTS = 3

/** Initial delay in ms before first retry; doubles each attempt (exponential backoff) */
export const RETRY_DELAY_MS = 1000

/** Maximum OTP send attempts per session before showing the "call us" fallback */
export const MAX_OTP_ATTEMPTS = 3

// ---------------------------------------------------------------------------
// Session storage
// ---------------------------------------------------------------------------

/** How long pending payment data is stored before it expires (30 minutes in ms) */
export const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000

/** Session storage key for pending payment data */
export const PENDING_PAYMENT_STORAGE_KEY = 'muncherz.pendingPayment'

// ---------------------------------------------------------------------------
// Timers and animation durations
// ---------------------------------------------------------------------------

/** Polling interval for the countdown timer (1 second in ms) */
export const COUNTDOWN_INTERVAL_MS = 1_000

/** Delay before the feedback modal appears after delivery confirmation (ms) */
export const FEEDBACK_MODAL_DELAY_MS = 2_000

/** How long the deals banner auto-scrolls between items (ms) */
export const DEALS_SCROLL_INTERVAL_MS = 4_000

/** Duration of the customizer exit fade animation — matches CSS/Framer duration */
export const CUSTOMIZER_EXIT_DURATION_MS = 300

/** Delay before the entry animation step 2 (implode) fires (ms) */
export const ANIMATION_IMPLODE_DELAY_MS = 500

/** Delay before the entry animation step 4 (reveal canvas) fires (ms) */
export const ANIMATION_REVEAL_DELAY_MS = 200

/** Daily special banner countdown refresh interval (ms) */
export const DAILY_SPECIAL_COUNTDOWN_INTERVAL_MS = 1_000

// ---------------------------------------------------------------------------
// UI / Layout
// ---------------------------------------------------------------------------

/** Component line-count limit per ai-instructions.md — split if exceeded */
export const MAX_COMPONENT_LINES = 200

/** Quick-add saved creations limit per user */
export const QUICK_ADD_SAVED_LIMIT = 8

/** Quick-add recent orders limit */
export const QUICK_ADD_ORDERS_LIMIT = 3

// ---------------------------------------------------------------------------
// Customizer
// ---------------------------------------------------------------------------

/** Minimum quantity for a core/required ingredient */
export const MIN_CORE_INGREDIENT_QTY = 1

/** Default fallback prep time in minutes when menu item prep_time is missing */
export const DEFAULT_PREP_TIME_MINUTES = 15
