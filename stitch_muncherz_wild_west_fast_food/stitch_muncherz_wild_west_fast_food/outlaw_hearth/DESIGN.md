---
name: Outlaw Hearth
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e5bdb9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ac8885'
  outline-variant: '#5c403d'
  surface-tint: '#ffb4ac'
  primary: '#ffb4ac'
  on-primary: '#690007'
  primary-container: '#d72b2b'
  on-primary-container: '#fff3f2'
  inverse-primary: '#bc131b'
  secondary: '#ffd65b'
  on-secondary: '#3d2f00'
  secondary-container: '#e7b900'
  on-secondary-container: '#5f4a00'
  tertiary: '#ffb59b'
  on-tertiary: '#5b1a00'
  tertiary-container: '#b15734'
  on-tertiary-container: '#fff4f1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#93000e'
  secondary-fixed: '#ffe08b'
  secondary-fixed-dim: '#f0c110'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#7b2e0f'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-brown: '#1C1410'
  charcoal-muted: '#2A2420'
  paper-white: '#F5F0E8'
  ember-glow: rgba(215, 43, 43, 0.15)
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  section-label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 20px
    letterSpacing: 0.1em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  price-tag:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on a "Neon Frontier" aesthetic—a modern, dark-mode interpretation of Wild West hospitality. It balances the grit of a rustic ranch with the high-energy glow of a late-night saloon. The target audience is hungry, adventurous, and mobile-native, seeking a bold food-ordering experience that feels substantial and rewarding.

The style leverages **Modern-Brutalist** foundations mixed with **Tactile** overlays. Expect deep, textured backgrounds, sharp typographic hierarchies, and "Ember Glow" gradients that draw the eye to critical conversion points. The interface evokes warmth and urgency, mimicking the heat of a charcoal grill against the night sky.

## Colors

The palette is dominated by **Deep Black** and **Warm Dark Brown** to establish a rugged, nocturnal environment. **Primary Red** functions as the "heat" of the brand, used for high-action items and branding. **Primary Yellow** is reserved for gold-standard information: prices, ratings, and rewards.

A **Rust/Ember** accent is used sparingly for decorative borders and subtle glows, bridging the gap between the dark surfaces and the vibrant red. Contrast is maintained via **Off-White**, ensuring legibility without the harshness of pure white on a dark background.

## Typography

This design system uses a high-contrast typographic pairing. **DM Sans** (serving as a modern, sturdy geometric alternative to classic slab-serifs) handles display roles and headlines with maximum weight. **Inter** provides high-performance legibility for body text and descriptions, essential for long menus and Urdu script support.

**Section Headings** must always be set in Uppercase with expanded letter spacing to evoke the feeling of stamped leather or wood-burned signage. **JetBrains Mono** is utilized specifically for pricing and technical data, providing a "tally" or "receipt" feel that stands out in Primary Yellow.

## Layout & Spacing

The system follows a **Mobile-First, Fluid Grid** philosophy. On mobile devices, a 4-column grid is used with 20px outer margins. Spacing is strictly based on a 4px baseline, ensuring vertical rhythm between menu items and price labels.

**RTL Support:** The layout is designed to mirror seamlessly for Urdu. Components such as "Add to Cart" and "Back" buttons must swap positions, and the price tag (Monospace) remains readable in its numerical format while text alignment shifts to the right. 

Use **Safe Area Insets** for bottom-fixed "Order Now" bars to ensure they do not interfere with OS-level gestures.

## Elevation & Depth

Depth is created through **Tonal Layering** and **Atmospheric Glows** rather than traditional drop shadows. 
- **Level 0 (Base):** Deep Black (#0F0F0F) with a subtle rustic grain overlay.
- **Level 1 (Cards):** Warm Dark Brown (#1C1410) with a 1px Rust border.
- **Level 2 (Overlays/Modals):** Muted Charcoal (#2A2420).

Floating Action Buttons (FABs) and Primary buttons use a **Red Glow** (outer shadow with high blur and low opacity) to simulate heat radiating from the element. Bottom sheets utilize a heavy backdrop blur to keep the focus on the selection while maintaining a sense of place.

## Shapes

The shape language is varied to create visual hierarchy:
- **Large Containers (Cards):** 12px corners provide a friendly but structured look.
- **Surface Sheets:** 24px top-rounded corners for bottom sheets, creating a "soft-scoop" pull-up effect.
- **Interactive Elements:** 8px corners for buttons and input fields to maintain a tighter, more functional aesthetic.
- **Status Indicators:** Pill-shaped (fully rounded) badges for categories and tags.

## Components

### Buttons
- **Primary:** Solid Primary Red (#D72B2B) with Off-White text. 8px corner radius.
- **Secondary:** Outlined in Primary Red with 1px thickness.
- **Price Action:** A hybrid button with a dark brown base and a yellow price tag integrated into the right-hand side.

### Cards
- **Food Item Card:** Warm Dark Brown (#1C1410) background, 1px Rust border (#8B3A1A). Images should have a subtle darkening gradient at the bottom to ensure the white/yellow text overlay remains legible.

### Inputs & Selection
- **Inputs:** Muted Charcoal background, 8px radius. Active state uses a Primary Red border.
- **Stars:** Always Primary Yellow (#F5C518). Use solid stars for ratings.
- **Pill Badges:** Solid Red with small font-size caps for "New" or "Spicy" tags.

### Feedback & Overlays
- **Bottom Sheets:** Mobile-specific sheets for customization (e.g., adding extra toppings). These use a 24px corner radius and a Dark Brown surface.
- **Rustic Overlays:** A low-opacity (3-5%) noise or texture overlay should be applied to all large containers to break the "digital" flatness and reinforce the Wild West theme.