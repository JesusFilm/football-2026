import { ImageResponse } from "next/og";

export const alt = "World Cup 2026 Activate by Jesus Film Project";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type Props = {
  brand?: string;
  headline?: string;
  tagline?: string;
};

export function OpenGraphImage({
  brand = "Jesus Film Project",
  headline = "World Cup 2026 Outreach",
  tagline = "Every match, every nation, every soul.",
}: Props) {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0a0806 0%, #1c1812 48%, #e63946 100%)",
        color: "#f5f1e8",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#f5f1e8",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4,
          marginBottom: 28,
          textTransform: "uppercase",
        }}
      >
        {brand}
      </div>
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          letterSpacing: 0,
          lineHeight: 1,
          maxWidth: 960,
          textAlign: "center",
        }}
      >
        {headline}
      </div>
      <div
        style={{
          color: "rgba(245, 241, 232, 0.82)",
          fontSize: 34,
          lineHeight: 1.35,
          marginTop: 30,
          maxWidth: 820,
          textAlign: "center",
        }}
      >
        {tagline}
      </div>
    </div>,
    size,
  );
}
