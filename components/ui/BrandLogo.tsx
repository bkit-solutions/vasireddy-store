import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "header" | "footer";
  className?: string;
};

const sizeClasses = {
  header: {
    frame: "h-9 w-9 rounded-xl p-1 md:h-10 md:w-10",
    image: "h-6 w-6 md:h-7 md:w-7",
  },
  footer: {
    frame: "h-11 w-11 rounded-2xl p-1.5",
    image: "h-8 w-8",
  },
};

export function BrandLogo({ size = "header", className }: BrandLogoProps) {
  const styles = sizeClasses[size];

  return (
    <span
      className={cn(
        "flex items-center justify-center border border-studio-primary/10 bg-white shadow-[0_12px_24px_-18px_rgba(63,52,143,0.45)]",
        styles.frame,
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="Vasireddy Designer Studio"
        width={64}
        height={64}
        priority={size === "header"}
        className={cn("object-contain", styles.image)}
      />
    </span>
  );
}