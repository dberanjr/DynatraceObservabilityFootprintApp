import React from "react";

type GradientIconTileProps = {
  gradient: { from: string; to: string };
  icon: React.ReactNode;
  size?: "sm" | "md";
};

export const GradientIconTile = ({
  gradient,
  icon,
  size = "md",
}: GradientIconTileProps) => {
  const dim = size === "sm" ? 32 : 40;
  const iconSize = size === "sm" ? 16 : 20;
  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        flexShrink: 0,
        fontSize: iconSize,
        color: "#FFFFFF",
      }}
    >
      {icon}
    </div>
  );
};
