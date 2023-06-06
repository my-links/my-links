import Link from "next/link";
import { ReactNode } from "react";

export default function ButtonLink({
  href = "#",
  onClick,
  children,
}: {
  href?: string;
  onClick?: (...args: any) => any;
  children: ReactNode;
}) {
  const handleClick = (event) => {
    event.preventDefault();
    onClick && onClick();
  };
  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
