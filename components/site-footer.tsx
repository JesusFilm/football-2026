export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line px-10 pt-6 pb-7 text-center text-xs text-fg-mute">
      © 2026 Jesus Film Project · All rights reserved ·{" "}
      <a
        href="https://www.jesusfilm.org/terms/"
        target="_blank"
        rel="noreferrer"
        className="mx-1 text-fg-dim underline underline-offset-2 hover:text-fg"
      >
        Terms of Use
      </a>{" "}
      ·{" "}
      <a
        href="https://www.jesusfilm.org/privacy/"
        target="_blank"
        rel="noreferrer"
        className="mx-1 text-fg-dim underline underline-offset-2 hover:text-fg"
      >
        Your Privacy
      </a>
    </footer>
  );
}
