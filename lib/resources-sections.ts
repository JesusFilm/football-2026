// Shared catalog of /resources section anchors. Used by the SiteNav
// Resources dropdown. Order here drives the dropdown row order.
//
// Per AGENTS.md: stable identifiers (anchor IDs, ordering) live here in
// lib/, NOT in translations. Labels are i18n'd under ResourcesSectionNav.

export type ResourceSection = {
  /** Stable slug — matches the i18n key under
   *  ResourcesSectionNav.items.<id>. */
  id:
    | "teamTidyUp"
    | "mediaCollection"
    | "nextStepsJourneys"
    | "youVersionPlans"
    | "watchPartyKit";
  /** Fragment ID on /resources (matches the target H2's `id`). */
  anchor: string;
};

export const RESOURCE_SECTIONS: readonly ResourceSection[] = [
  { id: "teamTidyUp", anchor: "teamtidyup-heading" },
  { id: "mediaCollection", anchor: "video-collection-heading" },
  { id: "nextStepsJourneys", anchor: "journey-collection-heading" },
  { id: "youVersionPlans", anchor: "youversion-collection-heading" },
  { id: "watchPartyKit", anchor: "watchparty-heading" },
] as const;
