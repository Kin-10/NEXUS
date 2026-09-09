import './skinPresentation.css';

import React, { type CSSProperties } from 'react';

import type { SkinPresentation } from '../../../shared/skin/presentation';
import { useSkin } from '../../providers/SkinProvider';

type SkinPresentationStyle = CSSProperties & Record<`--baiying-skin-${string}`, string>;

export const buildSkinPresentationStyle = (
  presentation: SkinPresentation,
): SkinPresentationStyle => ({
  '--baiying-skin-canvas': presentation.palette.canvas,
  '--baiying-skin-panel': presentation.palette.panel,
  '--baiying-skin-panel-raised': presentation.palette.panelRaised,
  '--baiying-skin-accent': presentation.palette.accent,
  '--baiying-skin-accent-foreground': presentation.palette.accentForeground,
  '--baiying-skin-accent-alt': presentation.palette.accentAlt,
  '--baiying-skin-foreground': presentation.palette.foreground,
  '--baiying-skin-muted': presentation.palette.muted,
  '--baiying-skin-border': presentation.palette.border,
  '--baiying-skin-focus-x': `${(presentation.art?.focusX ?? 0.5) * 100}%`,
  '--baiying-skin-focus-y': `${(presentation.art?.focusY ?? 0.5) * 100}%`,
});

interface SkinPresentationScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  enabled: boolean;
}

const SkinPresentationScope: React.FC<SkinPresentationScopeProps> = ({
  children,
  enabled,
  style,
  ...props
}) => {
  const { activeSkin } = useSkin();
  const presentation = enabled ? activeSkin?.presentation : undefined;

  return (
    <div
      {...props}
      data-skin-presentation={presentation?.mode}
      style={presentation ? { ...style, ...buildSkinPresentationStyle(presentation) } : style}
    >
      {children}
    </div>
  );
};

export default SkinPresentationScope;
