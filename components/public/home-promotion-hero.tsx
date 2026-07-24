import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Gamepad2, Laptop, Shirt, Smartphone, Tv } from "lucide-react";

type FeaturedCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type FallbackCategory = {
  id: string;
  name: string;
  icon: typeof Laptop;
};

const fallbackCategories: FallbackCategory[] = [
  { id: "laptops", name: "Նոութբուքեր", icon: Laptop },
  { id: "phones", name: "Սմարթֆոններ", icon: Smartphone },
  { id: "televisions", name: "Հեռուստացույցներ", icon: Tv },
  { id: "gaming", name: "Խաղային", icon: Gamepad2 },
  { id: "fashion", name: "Հագուստ և կոշիկ", icon: Shirt },
];

type HomePromotionHeroProps = {
  categories: FeaturedCategory[];
};

type HeroCategory = {
  id: string;
  name: string;
  href: Route;
  imageUrl?: string | null;
  icon?: typeof Laptop;
};

export function HomePromotionHero({ categories }: HomePromotionHeroProps) {
  const heroCategories: HeroCategory[] = categories.length
    ? categories.slice(0, 5).map((category) => ({
        id: category.id,
        name: category.name,
        href: `/categories/${category.slug}` as Route,
        imageUrl: category.image_url,
      }))
    : fallbackCategories.map((category) => ({
        ...category,
        href: "/categories" as Route,
      }));

  return (
    <section className="px-3 py-5 sm:px-5 sm:py-6 lg:px-6" aria-labelledby="home-promotions-heading">
      <div className="mx-auto max-w-[1200px]">
        <h1 id="home-promotions-heading" className="sr-only">Հատուկ առաջարկներ և կատեգորիաներ</h1>

        <nav aria-label="Ընտրված կատեգորիաներ" className="flex gap-3 overflow-x-auto pb-1">
          {heroCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.id}
                href={category.href}
                className="group flex min-h-12 min-w-[156px] items-center gap-2.5 rounded-full border border-[var(--color-border-muted)] bg-white px-3 py-2 shadow-[var(--shadow-subtle)] transition hover:border-[var(--color-border)] hover:bg-[var(--color-page-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--color-page-bg)] text-[var(--color-text-secondary)]">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt="" className="h-full w-full object-contain" />
                  ) : Icon ? (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-4 text-[var(--color-text-primary)] transition group-hover:text-[var(--color-brand-red)]">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
          <PromotionCard
            href="/shop"
            imageSrc=""
            imageAlt=""
            eyebrow="Ամառային ընտրանի"
            title="Ամառային զեղչեր"
            description="Գտեք սեզոնային ապրանքներ և համեմատեք խանութների գները։"
            action="Դիտել առաջարկները"
            className="min-h-[300px] sm:min-h-[356px]"
          />
          <PromotionCard
            href="/categories"
            imageSrc=""
            imageAlt=""
            eyebrow="Տուն և հանգիստ"
            title="Բացօթյա հարմարավետություն"
            description="Ընտրեք տան և այգու ապրանքները՝ մեկ վայրում համեմատելով տարբերակները։"
            action="Բացահայտել"
            className="min-h-[300px] sm:min-h-[356px]"
          />
        </div>
      </div>
    </section>
  );
}

type PromotionCardProps = {
  href: Route;
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  className?: string;
};

function PromotionCard({ imageSrc, imageAlt, eyebrow, title, description, action, href, className }: PromotionCardProps) {
  const hasImage = Boolean(imageSrc);

  return (
    <Link
      href={href}
      className={`group relative isolate block overflow-hidden rounded-lg bg-[var(--color-border-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2 ${className ?? ""}`}
    >
      {hasImage ? <img src={imageSrc} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover transition duration-200 motion-reduce:transition-none group-hover:scale-[1.02]" /> : null}
      {hasImage ? <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-transparent" aria-hidden="true" /> : null}
      <div className="relative flex h-full max-w-[440px] flex-col justify-end p-5 sm:p-7">
        <p className={`text-sm font-semibold ${hasImage ? "text-white/90" : "text-[var(--color-text-secondary)]"}`}>{eyebrow}</p>
        <h2 className={`mt-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl ${hasImage ? "text-white" : "text-[var(--color-text-primary)]"}`}>{title}</h2>
        <p className={`mt-3 text-sm leading-6 sm:text-base ${hasImage ? "text-white/90" : "text-[var(--color-text-secondary)]"}`}>{description}</p>
        <span className="mt-5 inline-flex w-fit min-h-10 items-center gap-2 rounded-md bg-[var(--color-brand-red)] px-4 text-sm font-semibold text-white transition group-hover:bg-[var(--color-brand-red-hover)]">
          {action}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
