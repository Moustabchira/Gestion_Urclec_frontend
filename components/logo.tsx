
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ size = "md", withText = true }: LogoProps) {
  const sizes = {
    sm: 30, // pixels
    md: 40,
    lg: 42,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div >
        <Image
          src="/images/urclec.png" // 👈 chemin vers ton image dans public/images
          alt="Logo IFNTI"
          width={sizes[size]}
          height={sizes[size]}
        />
      </div>
      {withText && (
        <div className={`font-bold ${textSizes[size]}`}>
          <span className="text-primary">URCLEC</span>
        </div>
      )}
    </div>
  );
}
