---
name: Verdant Healing
colors:
  surface: '#edfdf2'
  surface-dim: '#ceded3'
  surface-bright: '#edfdf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e7f8ed'
  surface-container: '#e1f2e7'
  surface-container-high: '#dcece1'
  surface-container-highest: '#d6e6dc'
  on-surface: '#111e18'
  on-surface-variant: '#404943'
  inverse-surface: '#25332c'
  inverse-on-surface: '#e4f5ea'
  outline: '#707972'
  outline-variant: '#c0c9c1'
  surface-tint: '#2d694d'
  primary: '#125238'
  on-primary: '#ffffff'
  primary-container: '#2f6b4f'
  on-primary-container: '#aae9c6'
  inverse-primary: '#96d4b2'
  secondary: '#276a46'
  on-secondary: '#ffffff'
  secondary-container: '#acf2c4'
  on-secondary-container: '#2e714c'
  tertiary: '#3d4c3f'
  on-tertiary: '#ffffff'
  tertiary-container: '#556456'
  on-tertiary-container: '#cfe0ce'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0cd'
  primary-fixed-dim: '#96d4b2'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#105137'
  secondary-fixed: '#acf2c4'
  secondary-fixed-dim: '#91d5a9'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#055230'
  tertiary-fixed: '#d6e7d5'
  tertiary-fixed-dim: '#bacbba'
  on-tertiary-fixed: '#111f14'
  on-tertiary-fixed-variant: '#3c4a3d'
  background: '#edfdf2'
  on-background: '#111e18'
  surface-variant: '#d6e6dc'
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is centered on a "Nature-Inspired Healthcare" philosophy. It aims to evoke a sense of safety, tranquility, and organic growth, moving away from clinical coldness toward a warm, therapeutic sanctuary. The target audience includes individuals seeking mental health support who require an environment that feels both professional and deeply empathetic.

The style is **Soft Modern Healthcare**. It leverages a high-vibrancy "Mint White" background to maintain cleanliness while using layers of organic greens to establish trust. The aesthetic prioritizes generous whitespace to reduce cognitive load, soft-weighted typography to maintain an approachable tone, and subtle organic curves that mimic natural forms rather than rigid geometric structures.

## Colors

The palette is a monochromatic green scale designed to lower heart rates and ground the user. 
- **Primary (#2F6B4F):** Used for key actions, brand identity, and high-level headings. It provides the "Forest Green" anchor of authority and depth.
- **Secondary (#8BCFA3):** A calming "Sage" used for supporting elements, success states, and decorative icons.
- **Accent (#DDEEDC):** A "Pale Green" used for large surface areas, subtle highlighting, and hover states to maintain a soft contrast.
- **Text (#1F2D26):** A "Deep Dark Green" that replaces pure black to ensure the interface feels unified and never harsh.
- **Background (#F4FAF6):** A "Mint White" that provides a breathable, airy foundation for all components.

## Typography

This design system utilizes **Noto Sans** for its exceptional clarity and humanist qualities. The typographic hierarchy is intentionally "softened"—avoiding the "Black" or "Extra Bold" weights in favor of Medium and Semi-Bold to prevent the UI from feeling aggressive. 

Large headlines use tighter letter-spacing and organic line heights to create a grounded, editorial feel. Body text is set with generous line-height (1.6) to ensure maximum readability for users who may be in a state of high stress or emotional vulnerability.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with wide margins to create a sense of "open air." 
- **Desktop:** 12-column grid with 24px gutters and 80px side margins.
- **Tablet:** 8-column grid with 24px gutters and 40px side margins.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.

Vertical spacing is intentionally "oversized." Elements should be given room to breathe, using the `lg` (48px) and `xl` (80px) tokens to separate major content blocks. This prevents the interface from feeling cluttered, which is essential for a therapeutic context.

## Elevation & Depth

To maintain the "Nature-Inspired" aesthetic, this design system avoids heavy, artificial shadows. Instead, it utilizes:

1.  **Tonal layering:** Using the Accent (#DDEEDC) color to create subtle containers on top of the Mint White background.
2.  **Organic Shadows:** When elevation is required (e.g., for cards or floating buttons), use a very soft, diffused shadow: `box-shadow: 0 10px 30px rgba(47, 107, 79, 0.08);`. The shadow is tinted with the Primary color to keep it "natural" rather than grey.
3.  **Low-Contrast Outlines:** Interactive elements use 1px borders in the Secondary (#8BCFA3) color at low opacity (20%) instead of shadows to define boundaries softly.

## Shapes

The design system uses **Pill-shaped (Level 3)** roundedness to communicate friendliness and approachability. Sharp corners are entirely avoided. 

Standard components (inputs, buttons) use a 1rem (16px) radius, while larger containers (cards, modals) should use a 2rem (32px) radius. Hero images and featured content should utilize "Organic Masking"—using asymmetric blob-like shapes or extreme rounding to mimic the unpredictability of natural elements like leaves or river stones.

## Components

### Buttons
Primary buttons are pill-shaped, filled with Primary (#2F6B4F), and use white text. Secondary buttons use a thick 2px border of the Primary color with a transparent background. Hover states should involve a gentle shift to the Secondary (#8BCFA3) color.

### Input Fields
Inputs should have a background of the Mint White (#F4FAF6) and a 1px border of the Accent color. On focus, the border transitions to Primary green with a soft outer glow. The corners must be fully rounded.

### Cards
Cards are the primary container for services and therapist profiles. They should feature a 32px corner radius, a subtle Primary-tinted shadow, and plenty of internal padding (min 32px).

### Chips/Tags
Used for "Specialties" (e.g., Anxiety, CBT). These should be small, pill-shaped, using the Secondary (#8BCFA3) background at 20% opacity with Deep Green text to ensure they are legible but not distracting.

### Progress Indicators
For intake forms, use "Growing Stem" indicators—soft green lines that fill smoothly, avoiding harsh ticking or industrial loading bars.