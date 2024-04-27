import { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react';

export default function ExternalLink({
  children,
  title,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  style?: CSSProperties;
  title?: string;
  className?: string;
}) {
  return (
    <a target="_blank" rel="noreferrer" title={title} {...props}>
      {children}
    </a>
  );
}
