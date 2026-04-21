import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLocalizedLanguageName,
  LanguagePicker,
  setPreferredLocaleCookie,
} from "@/components/language-picker";

const activeLocale = vi.hoisted(() => ({ value: "es" }));

vi.mock("next-intl", () => ({
  useLocale: () => activeLocale.value,
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (key === "ariaLabel") return "Cambiar idioma";
    if (key === "menuLabel") return "Elige un idioma";
    if (key === "currentLanguage") return `Idioma actual: ${values?.language}`;
    return key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/africa",
}));

describe("LanguagePicker", () => {
  afterEach(() => {
    activeLocale.value = "es";
    document.cookie = "NEXT_LOCALE=; Max-Age=0; Path=/";
  });

  it("shows language subtitles in the active locale", () => {
    render(<LanguagePicker />);

    fireEvent.click(screen.getByRole("button", { name: "Cambiar idioma" }));

    expect(screen.getByRole("menu")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("francés")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("alemán")).toBeInTheDocument();
    expect(screen.getByText("العربية").closest("a")).not.toHaveAttribute("dir");
    expect(screen.queryByText("French")).not.toBeInTheDocument();
    expect(screen.queryByText("German")).not.toBeInTheDocument();
  });

  it("aligns the whole menu to the active RTL locale instead of each option", () => {
    activeLocale.value = "ar";

    render(<LanguagePicker />);

    fireEvent.click(screen.getByRole("button", { name: "Cambiar idioma" }));

    expect(screen.getByRole("menu")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("English").closest("a")).not.toHaveAttribute("dir");
  });

  it("can localize language names without the component", () => {
    expect(getLocalizedLanguageName("fr", "pt-BR", "Portuguese")).toBe(
      "portugais brésilien",
    );
    expect(getLocalizedLanguageName("de", "zh-Hans", "Chinese")).toBe(
      "Chinesisch (vereinfacht)",
    );
  });

  it("sets the preferred locale cookie when a language is selected", () => {
    setPreferredLocaleCookie("pt-BR");

    expect(document.cookie).toContain("NEXT_LOCALE=pt-BR");
  });
});
