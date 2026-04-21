import type { Region } from "@/lib/regions";

type Props = {
  flagCodes: Region["flagCodes"];
  size?: "sm" | "lg";
};

export function RegionFlags({ flagCodes, size = "sm" }: Props) {
  const dimensions = size === "lg" ? "h-[15px] w-5" : "h-[10px] w-3.5";

  return (
    <>
      {flagCodes.map((flag) => (
        <span
          key={flag.countryCode}
          className={`fi fi-${flag.countryCode} ${dimensions} inline-block overflow-hidden`}
          aria-label={flag.label}
          role="img"
          title={flag.label}
        />
      ))}
    </>
  );
}
