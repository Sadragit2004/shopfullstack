import React from "react";

type IconProps = { className?: string; filled?: boolean };
const base = "stroke-current fill-none";

export const Icon = {
  Search: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16" y2="16" />
      </g>
    </svg>
  ),
  Sun: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <circle cx="12" cy="12" r="4.2" />
        <line x1="12" y1="1.5" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="22.5" />
        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
        <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
        <line x1="1.5" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="22.5" y2="12" />
        <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
      </g>
    </svg>
  ),
  Moon: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
    </svg>
  ),
  Menu: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round">
      <g className={base}>
        <line x1="3" y1="7" x2="21" y2="7" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="17" x2="21" y2="17" />
      </g>
    </svg>
  ),
  X: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round">
      <g className={base}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </g>
    </svg>
  ),
  ChevronDown: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline className={base} points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronBack: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline className={base} points="15 18 9 12 15 6" />
    </svg>
  ),
  ArrowMore: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </g>
    </svg>
  ),
  Star: ({ className, filled }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.5} strokeLinejoin="round">
      <polygon
        className={filled ? "fill-current stroke-current" : "fill-none stroke-current"}
        points="12 2.5 15 8.7 21.8 9.6 16.9 14.3 18.1 21 12 17.7 5.9 21 7.1 14.3 2.2 9.6 9 8.7"
      />
    </svg>
  ),
  Heart: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path
        className={base}
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"
      />
    </svg>
  ),
  Cart: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M1 1h4l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 6H6" />
      </g>
    </svg>
  ),
  User: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </g>
    </svg>
  ),
  Truck: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <rect x="1" y="6" width="14" height="10" rx="1.2" />
        <path d="M15 10h4.5L22 13v3h-7z" />
        <circle cx="6" cy="18.5" r="1.8" />
        <circle cx="18" cy="18.5" r="1.8" />
      </g>
    </svg>
  ),
  Shield: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M12 21.5s7.5-3.6 7.5-9.6V5.4L12 2.5 4.5 5.4v6.5c0 6 7.5 9.6 7.5 9.6z" />
        <polyline points="8.7 12 10.8 14.1 15.3 9.6" />
      </g>
    </svg>
  ),
  Return: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <polyline points="3 3 3 6.5 6.5 6.5" />
      </g>
    </svg>
  ),
  Headset: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <rect x="2.5" y="13" width="4" height="6" rx="1.3" />
        <rect x="17.5" y="13" width="4" height="6" rx="1.3" />
        <path d="M19.5 19v.5a3 3 0 0 1-3 3H12" />
      </g>
    </svg>
  ),
  Phone: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path
        className={base}
        d="M21 16.6v2.7a1.8 1.8 0 0 1-2 1.8 17.6 17.6 0 0 1-7.6-2.7 17.3 17.3 0 0 1-5.4-5.4A17.6 17.6 0 0 1 3.3 5.4 1.8 1.8 0 0 1 5.1 3.4h2.7a1.8 1.8 0 0 1 1.8 1.5c.1.9.3 1.7.6 2.5a1.8 1.8 0 0 1-.4 1.9L8.7 10.4a14.1 14.1 0 0 0 5.3 5.3l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.5 2.5.6a1.8 1.8 0 0 1 1.5 1.8z"
      />
    </svg>
  ),
  Mail: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <rect x="2.5" y="4.5" width="19" height="15" rx="1.6" />
        <polyline points="2.5 6 12 13 21.5 6" />
      </g>
    </svg>
  ),
  Pin: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M20 10.2c0 6.2-8 11.8-8 11.8s-8-5.6-8-11.8a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10.2" r="2.6" />
      </g>
    </svg>
  ),
  Clock: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </g>
    </svg>
  ),
  Box: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M21 7.5 12 3 3 7.5 12 12l9-4.5z" />
        <path d="M3 7.5v9L12 21l9-4.5v-9" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </g>
    </svg>
  ),
  Tag: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M20.6 13.4 11 3.8a1.9 1.9 0 0 0-1.3-.6L4 3l-.2 5.7c0 .5.2 1 .5 1.3l9.6 9.6a1.9 1.9 0 0 0 2.7 0l4-4a1.9 1.9 0 0 0 0-2.2z" />
        <circle cx="8" cy="8" r="1.4" />
      </g>
    </svg>
  ),
  TrendUp: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <polyline points="3 17 9.5 10.5 13.5 14.5 21 6" />
        <polyline points="15 6 21 6 21 12" />
      </g>
    </svg>
  ),
  Sparkles: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M11.5 3 13 8l5 1.5-5 1.5-1.5 5L10 11 5 9.5 10 8z" />
        <path d="M18.5 15 19.3 17.2 21.5 18 19.3 18.8 18.5 21 17.7 18.8 15.5 18 17.7 17.2z" />
      </g>
    </svg>
  ),
  Smartphone: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
        <line x1="11.5" y1="18.3" x2="12.5" y2="18.3" />
      </g>
    </svg>
  ),
  Laptop: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <line x1="2" y1="19.5" x2="22" y2="19.5" />
      </g>
    </svg>
  ),
  Shirt: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M8.5 3 12 5.3 15.5 3 20 6.3 17.3 9.5 15.5 8v12.5h-7V8L6.7 9.5 4 6.3z" />
    </svg>
  ),
  Home: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M3.5 11 12 4l8.5 7" />
        <path d="M5.5 9.5v10.5h13V9.5" />
      </g>
    </svg>
  ),
  Dumbbell: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <line x1="6.5" y1="7" x2="6.5" y2="17" />
        <line x1="17.5" y1="7" x2="17.5" y2="17" />
        <line x1="6.5" y1="12" x2="17.5" y2="12" />
        <line x1="3" y1="9.5" x2="3" y2="14.5" />
        <line x1="21" y1="9.5" x2="21" y2="14.5" />
      </g>
    </svg>
  ),
  Baby: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <circle cx="12" cy="7" r="3.2" />
        <path d="M7.5 21v-4a4.5 4.5 0 0 1 9 0v4" />
      </g>
    </svg>
  ),
  Book: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3z" />
    </svg>
  ),
  Car: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <path d="M4.5 11 6 6.8A2 2 0 0 1 7.9 5.5h8.2A2 2 0 0 1 18 6.8L19.5 11" />
        <rect x="2" y="11" width="20" height="6" rx="2" />
        <circle cx="7" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </g>
    </svg>
  ),
  Grid: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <g className={base}>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.3" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.3" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.3" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.3" />
      </g>
    </svg>
  ),
};

export const CATEGORY_ICON_MAP: Record<string, (p: IconProps) => JSX.Element> = {
  smartphone: Icon.Smartphone,
  laptop: Icon.Laptop,
  shirt: Icon.Shirt,
  home: Icon.Home,
  sparkles: Icon.Sparkles,
  dumbbell: Icon.Dumbbell,
  baby: Icon.Baby,
  book: Icon.Book,
  car: Icon.Car,
};