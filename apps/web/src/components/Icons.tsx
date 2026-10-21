import * as React from "react";
import InlineSVG from "react-inlinesvg";

const icons = {
  calendar: new URL("../icons/calendar.svg", import.meta.url),
  checklist: new URL("../icons/checklist.svg", import.meta.url),
  close: new URL("../icons/close.svg", import.meta.url),
  menu: new URL("../icons/menu.svg", import.meta.url),
  tools: new URL("../icons/tools.svg", import.meta.url),
};

export type IconName = keyof typeof icons;

type IconsProps = {
  name: IconName;
  width?: number;
  height?: number;
  className?: string;
};

export function Icons({
  name,
  width = 28,
  height = width,
  className = "",
}: IconsProps) {
  const icon = icons[name];
  const dimensions: React.CSSProperties = {
    width,
    height,
    minWidth: width,
    minHeight: height,
  };

  return (
    <InlineSVG
      src={icon.href}
      width={width}
      height={height}
      className={className}
      style={dimensions}
      aria-hidden="true"
      focusable="false"
      loader={
        <span className={className} style={dimensions} aria-hidden="true" />
      }
    />
  );
}
