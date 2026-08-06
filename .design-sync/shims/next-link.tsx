// Shim di `next/link`: un <a> nativo. Le preview non navigano.
import * as React from "react";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string };
  prefetch?: boolean; replace?: boolean; scroll?: boolean; shallow?: boolean;
};

export default function Link({ href, prefetch, replace, scroll, shallow, children, ...rest }: Props) {
  const h = typeof href === "string" ? href : (href?.pathname ?? "#");
  return <a href={h} {...rest}>{children}</a>;
}
export { Link };
