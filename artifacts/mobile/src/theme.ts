export const Colors = {
  bg: "#000000",
  surface: "#0a0f1e",
  card: "#0d0d0d",
  cardAlt: "#111827",
  border: "#1a1a2e",
  borderLight: "#ffffff10",
  primary: "#00D4FF",
  primaryDim: "#00D4FF20",
  primaryBorder: "#00D4FF40",
  text: "#ffffff",
  textSecondary: "#e2e8f0",
  muted: "#6b7280",
  mutedLight: "#9ca3af",
  green: "#10b981",
  greenDim: "#10b98120",
  red: "#ef4444",
  redDim: "#ef444410",
  redBorder: "#ef444440",
  amber: "#f59e0b",
  whatsapp: "#25D366",
  whatsappDim: "#25D36620",
  whatsappBorder: "#25D36640",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Typography = {
  hero: { fontSize: 48, fontWeight: "900" as const, letterSpacing: -2, color: Colors.text },
  h1: { fontSize: 28, fontWeight: "900" as const, letterSpacing: -1, color: Colors.text, textTransform: "uppercase" as const },
  h2: { fontSize: 20, fontWeight: "900" as const, letterSpacing: -0.5, color: Colors.text, textTransform: "uppercase" as const },
  h3: { fontSize: 16, fontWeight: "800" as const, color: Colors.text, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  label: { fontSize: 11, fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 2, color: Colors.primary },
  body: { fontSize: 14, color: Colors.muted, lineHeight: 22 },
  caption: { fontSize: 12, color: Colors.muted },
} as const;
