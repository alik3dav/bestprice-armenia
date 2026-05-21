export function createSlug(input: string, separator: "-" | "_" = "-") {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`\\${separator}{2,}`, "g"), separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "");

  return normalized;
}


export const slugify = (input: string) => createSlug(input, "-");
