import React from "react";

const Svg = ({
  children,
  size = 18,
}: {
  children: React.ReactNode;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const HostIcon = () => (
  <Svg>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <circle cx="7" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="7" cy="18" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const ProcessIcon = () => (
  <Svg>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M9 9h6v6H9z" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </Svg>
);

export const ContainerIcon = () => (
  <Svg>
    <path d="M22 12l-10-6L2 12l10 6 10-6z" />
    <path d="M12 6v12" />
    <path d="M2 12l10 6" />
    <path d="M22 12l-10 6" />
    <path d="M7 9l10 6" />
    <path d="M17 9l-10 6" />
  </Svg>
);

export const KubernetesIcon = () => (
  <Svg>
    <path d="M12 2l8 4.5v7L12 18l-8-4.5v-7L12 2z" />
    <path d="M12 18v4" />
    <path d="M12 2v6" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const ServiceIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </Svg>
);

export const DatabaseIcon = () => (
  <Svg>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
  </Svg>
);

export const LambdaIcon = () => (
  <Svg>
    <path d="M4 20h3l5-12 5 12h3" />
    <path d="M6 4h4l6 16" />
  </Svg>
);

export const QueueIcon = () => (
  <Svg>
    <rect x="2" y="7" width="5" height="10" rx="1" />
    <rect x="9.5" y="7" width="5" height="10" rx="1" />
    <rect x="17" y="7" width="5" height="10" rx="1" />
    <path d="M7 12h2.5M14.5 12h2.5" />
  </Svg>
);

export const CloudIcon = () => (
  <Svg>
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </Svg>
);

export const WebAppIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </Svg>
);

export const MobileIcon = () => (
  <Svg>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
  </Svg>
);

export const SyntheticIcon = () => (
  <Svg>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 8v4l3 3" />
  </Svg>
);

export const VmwareIcon = () => (
  <Svg>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 10l3 4 4-6 3 4" />
  </Svg>
);

export const CustomDeviceIcon = () => (
  <Svg>
    <path d="M2 16.1A5 5 0 0115.9 6.2M9.5 2a6.5 6.5 0 0112.4 4.5" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9v-2M12 15v2M15 12h2M9 12H7" />
  </Svg>
);

export const NamespaceIcon = () => (
  <Svg>
    <path d="M3 3h18v18H3z" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </Svg>
);

export const TraceIcon = () => (
  <Svg>
    <path d="M2 12h4l3-9 4 18 3-9h6" />
  </Svg>
);

export const LogIcon = () => (
  <Svg>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
  </Svg>
);

export const SmartscapeIcon = () => (
  <Svg>
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M7.5 7.5l3 3M13.5 13.5l3 3M16.5 7.5l-3 3M7.5 16.5l3-3" />
  </Svg>
);

export const MttrIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Svg>
);

export const DynatraceLogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12.3 2.1c-.4-.2-.8-.1-1.1.2L3.6 9.9c-.3.3-.4.7-.2 1.1l4 8.4c.2.4.6.6 1 .6h7.6c.4 0 .8-.2 1-.6l4-8.4c.2-.4.1-.8-.2-1.1l-7.6-7.6c-.1-.1-.3-.2-.4-.2z"
      fill="url(#dt-grad)"
    />
    <defs>
      <linearGradient id="dt-grad" x1="3" y1="3" x2="21" y2="21">
        <stop stopColor="#1496FF" />
        <stop offset="1" stopColor="#6F2DA8" />
      </linearGradient>
    </defs>
  </svg>
);
