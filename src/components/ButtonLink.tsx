import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

export default function ButtonLink({
  href = "#",
  onClick,
  children,
  style = {},
}: {
  href?: string;
  onClick?: (...args: any) => any;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const handleClick = (event) => {
    event.preventDefault();
    onClick && onClick();
  };
  return (
    <Link href={href} onClick={handleClick} style={style}>
      {children}
    </Link>
  );
}
