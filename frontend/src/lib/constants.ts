/**
 * CONSTANTS: All magic numbers and strings live here.
 * WHY: Named constants are self-documenting, easy to change,
 *      and prevent typos from duplicating magic values.
 */
export const MAX_OTP_ATTEMPTS = 3;
export const OTP_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_ORDERS_PER_HOUR = 10;
export const MAX_PAYMENT_ATTEMPTS = 5;
export const MAX_ORDERS_PER_DAY = 50;
export const GENERAL_API_RATE_LIMIT = 100; // per IP per minute

export const KITCHEN_PIN_LOCKOUT_THRESHOLD = 3;
export const KITCHEN_PIN_LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const ORDER_GRACE_CANCEL_WINDOW_MS = 60 * 1000; // 60 seconds
export const RETRY_DELAY_MS = 1000;
export const MAX_RETRIES = 3;
export const FETCH_TIMEOUT_MS = 10000;

export const MAX_FEEDBACK_LENGTH = 500;
export const MAX_SPECIAL_INSTRUCTIONS_LENGTH = 500;
export const MAX_INGREDIENT_IMAGE_SIZE_BYTES = 200 * 1024; // 200 KB

export const TOAST_DURATION_MS = 3000;
export const NEW_ORDER_FLASH_DURATION_MS = 5000;
export const KDS_TIMER_INTERVAL_MS = 30000;
export const ANIMATION_IMPLODE_DELAY_MS = 300;
export const ANIMATION_REVEAL_DELAY_MS = 500;
export const CUSTOMIZER_EXIT_DURATION_MS = 300;
export const DEALS_SCROLL_INTERVAL_MS = 3000;
export const COUNTDOWN_INTERVAL_MS = 1000;
export const FEEDBACK_MODAL_DELAY_MS = 2000;
export const MAX_RETRY_ATTEMPTS = 3;


export const CUSTOMIZER_ENTRY_ANIMATION_MS = 500;
export const CUSTOMIZER_EXIT_ANIMATION_MS = 300;
export const ANIMATION_DURATION_LIGHT = 0.18;
export const ANIMATION_DURATION_NORMAL = 0.28;
export const ANIMATION_DURATION_HEAVY = 0.5;

export const CANVAS_ASPECT_RATIO = 4 / 3;
export const CANVAS_DEFAULT_WIDTH_PX = 360;
export const CANVAS_DEFAULT_HEIGHT_PX = 480;

export const TOP_BUN_Z_INDEX = 10;
export const BOTTOM_BUN_Z_INDEX = 1;

export const MAX_TABLES_DEFAULT = 10;
export const QR_CODE_SIZE_PX = 200;
export const QR_CODE_PRINT_SIZE_PX = 128;

export const MIN_PASSWORD_LENGTH = 8;
export const PKR_LOCALE = 'en-PK';
export const PKR_CURRENCY = 'PKR';

export const DEFAULT_PAGE_TITLE = 'Muncherz';
export const DEFAULT_PAGE_DESCRIPTION = 'Premium food ordering app';
