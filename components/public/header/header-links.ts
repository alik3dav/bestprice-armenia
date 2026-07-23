import type { Route } from "next";

export type HeaderLink = {
  href: Route;
  label: string;
};

export const headerLinks: HeaderLink[] = [
  { href: "/shop", label: "Առաջարկներ" },
  { href: "/categories", label: "Տեխնոլոգիա" },
  { href: "/categories", label: "Տուն և այգի" },
  { href: "/categories", label: "Նորաձևություն" },
  { href: "/categories", label: "Առողջություն" },
  { href: "/categories", label: "Սպորտ" },
];
