import { useTranslations } from "next-intl";

import { ResourceCard } from "@/components/resource-card";
import { resourcesByCategory, type ResourceCategory } from "@/lib/resources";

type Props = {
  category: ResourceCategory;
};

const CATEGORY_KEY: Record<
  ResourceCategory,
  "readyToUse" | "customizable" | "physicalKits"
> = {
  "ready-to-use": "readyToUse",
  customizable: "customizable",
  "physical-kit": "physicalKits",
};

export function ResourceCategorySection({ category }: Props) {
  const t = useTranslations("Resources.categories");
  const items = resourcesByCategory(category);
  if (items.length === 0) return null;

  const keyBase = CATEGORY_KEY[category];

  return (
    <section className="px-0 py-10 sm:py-14">
      <div className="mb-7 max-w-[640px]">
        <h2 className="font-display text-[clamp(24px,3.2vw,36px)] leading-[1.1] font-extrabold tracking-[-0.015em] text-fg">
          {t(`${keyBase}.heading` as const)}
        </h2>
        <p className="mt-2 text-base leading-[1.55] text-fg-dim">
          {t(`${keyBase}.body` as const)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}
