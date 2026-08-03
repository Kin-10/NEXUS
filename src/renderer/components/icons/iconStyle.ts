import type { IconProps, IconWeight } from '@phosphor-icons/react';

/** Shared Phosphor styling for LobsterAI chrome icons. */
export const IconWeightRegular: IconWeight = 'regular';
export const IconWeightFill: IconWeight = 'fill';

/** Default for navigation / toolbar chrome: fine line, currentColor. */
export const defaultIconProps: Pick<IconProps, 'weight' | 'aria-hidden'> = {
  weight: IconWeightRegular,
  'aria-hidden': true,
};

/** Filled weight only for active/toggle or solid action affordances (pin, stop). */
export const filledIconProps: Pick<IconProps, 'weight' | 'aria-hidden'> = {
  weight: IconWeightFill,
  'aria-hidden': true,
};

export type AppIconProps = {
  className?: string;
};
