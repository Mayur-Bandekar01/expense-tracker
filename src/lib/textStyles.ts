/**
 * Named Text Styles — Single Source of Truth
 *
 * Every piece of text in the UI must use one of these named styles.
 * Never use loose size/weight utilities directly on elements.
 *
 * Based on the Tailwind default type scale (B1 Typography).
 */

export const textStyles = {
  // HEADINGS — Page and section headings, largest to smallest
  // Heading 1 = Hero
  heading1: "text-6xl font-semibold tracking-tight leading-none",      // 60px / 60px
  heading2: "text-5xl font-semibold tracking-tight leading-none",      // 48px / 48px
  heading3: "text-4xl font-semibold tracking-tight leading-[40px]",    // 36px / 40px
  heading4: "text-3xl font-semibold tracking-tight leading-[36px]",    // 30px / 36px
  heading5: "text-2xl font-semibold tracking-tight leading-[32px]",    // 24px / 32px
  heading6: "text-xl font-semibold tracking-tight leading-[28px]",     // 20px / 28px

  // TITLES — Card titles, list item titles, labels that lead a block, nav items
  title1: "text-xl font-medium leading-[28px]",                        // 20px / 28px
  title2: "text-lg font-medium leading-[28px]",                        // 18px / 28px
  title3: "text-base font-medium leading-[24px]",                      // 16px / 24px
  title4: "text-sm font-medium leading-[20px]",                        // 14px / 20px
  title5: "text-xs font-medium leading-[16px]",                        // 12px / 16px

  // BODY — Running text. Within each size, 1 is strongest weight, last is regular.
  body1: "text-base font-semibold leading-[24px]",                     // 16px / 24px
  body2: "text-base font-medium leading-[24px]",                       // 16px / 24px
  body3: "text-base font-normal leading-[24px]",                       // 16px / 24px
  body4: "text-sm font-semibold leading-[20px]",                       // 14px / 20px
  body5: "text-sm font-medium leading-[20px]",                         // 14px / 20px
  body6: "text-sm font-normal leading-[20px]",                         // 14px / 20px

  // BUTTONS — Text inside buttons only
  buttonLg: "text-lg font-semibold leading-[28px]",                    // 18px / 28px
  buttonMd: "text-base font-semibold leading-[24px]",                  // 16px / 24px
  buttonSm: "text-sm font-semibold leading-[20px]",                    // 14px / 20px
  buttonXsm: "text-xs font-semibold leading-[16px]",                   // 12px / 16px

  // CAPTIONS — Metadata, helper text, badges, timestamps, fine print
  caption1: "text-sm font-medium leading-[20px]",                      // 14px / 20px
  caption2: "text-sm font-normal leading-[20px]",                      // 14px / 20px
  caption3: "text-xs font-semibold leading-[16px]",                    // 12px / 16px
  caption4: "text-xs font-medium leading-[16px]",                      // 12px / 16px
  caption5: "text-xs font-normal leading-[16px]",                      // 12px / 16px
} as const;

export type TextStyleKey = keyof typeof textStyles;

/**
 * Helper to get a text style by name.
 * Usage: <h1 className={tx('heading1')}>Title</h1>
 */
export function tx(key: TextStyleKey): string {
  return textStyles[key];
}

/**
 * Hero heading gradient text (B5 Hero section)
 * Dark: #FFFFFF → #9B9B9B | Light: #000000 → #666666
 * Only allowed on hero heading text, never on backgrounds.
 */
export const heroHeadingGradient = {
  dark: "bg-gradient-to-r from-white to-[#9B9B9B] bg-clip-text text-transparent",
  light: "bg-gradient-to-r from-black to-[#666666] bg-clip-text text-transparent",
};

/**
 * Apply text-wrap: balance to headings, pretty to body.
 * These should be applied at the element level, not globally.
 */
export const textWrap = {
  heading: "text-wrap-balance",
  body: "text-wrap-pretty",
};