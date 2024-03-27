import Link, { LinkProps } from 'next/link';
import { CSSProperties, ReactNode } from 'react';

export default function ExternalLink({
  children,
  title,
  ...props
}: LinkProps & {
  children: ReactNode;
  style?: CSSProperties;
  title?: string;
  className?: string;
}) {
  return (
    <Link
      target='_blank'
      rel='noreferrer'
      title={title}
      {...props}
    >
      {children}
    </Link>
  );
}
