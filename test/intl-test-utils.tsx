import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement, ReactNode } from "react";

import messages from "@/messages/en.json";

function createIntlWrapper(locale: string) {
  function IntlWrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return IntlWrapper;
}

type IntlRenderOptions = Omit<RenderOptions, "wrapper"> & {
  locale?: string;
};

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(ui: ReactElement, options?: IntlRenderOptions) {
  const { locale, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: locale ? createIntlWrapper(locale) : IntlWrapper,
    ...renderOptions,
  });
}
