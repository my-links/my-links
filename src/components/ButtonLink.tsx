import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

export default function ButtonLink({
  href = "#",
  onClick,
  children,
  style = {},
  className = "",
}: {
  href?: string;
  onClick?: (...args: any) => any;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const handleClick = (event) => {
    if (!href || href === "#") {
      event.preventDefault();
    }
    onClick && onClick();
  };
  return (
    <Link href={href} onClick={handleClick} style={style} className={className}>
      {children}
    </Link>
  );
}
