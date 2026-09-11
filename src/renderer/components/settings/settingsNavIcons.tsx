import React from 'react';

import {
  Brain,
  ChatCircle,
  Cpu,
  Cube,
  Envelope,
  Globe,
  Info,
  Keyboard,
  MoonStar,
  Palette,
  Plug,
  Sliders,
} from '../icons/iconParkCompat';
import type { IconProps } from '../icons/iconParkCompat';
import { iconParkOutlineProps } from '../icons/iconStyle';

type SettingsNavIconProps = {
  className?: string;
};

/** Optical size for settings sidebar glyphs inside 28px wells. */
const NAV_ICON_CLASS = 'h-4 w-4';

const renderNavIcon = (
  Icon: React.ComponentType<IconProps>,
  className?: string,
) => (
  <Icon
    className={className ?? NAV_ICON_CLASS}
    {...iconParkOutlineProps}
  />
);

export const SettingsNavGeneralIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Sliders, className);

export const SettingsNavAppearanceIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Palette, className);

export const SettingsNavShortcutsIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Keyboard, className);

export const SettingsNavAgentEngineIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Cpu, className);

export const SettingsNavModelIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Cube, className);

export const SettingsNavMemoryIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Brain, className);

export const SettingsNavDreamingIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(MoonStar, className);

export const SettingsNavImIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(ChatCircle, className);

export const SettingsNavBrowserIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Globe, className);

export const SettingsNavEmailIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Envelope, className);

export const SettingsNavPluginsIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Plug, className);

export const SettingsNavAboutIcon: React.FC<SettingsNavIconProps> = ({ className }) =>
  renderNavIcon(Info, className);
