import type { IconProps, IconWeight } from '@/components/icons/iconParkCompat';

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

/** Default for IconPark outline chrome icons: currentColor-driven and class-sized. */
export const iconParkOutlineProps = {
  size: '100%',
  strokeWidth: 4,
  fill: 'currentColor',
  'aria-hidden': true,
} as const;

export type AppIconProps = {
  className?: string;
};
