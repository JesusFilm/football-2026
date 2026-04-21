import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/reveal";

type IOCallback = IntersectionObserverCallback;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IOCallback;
  observed: Element[] = [];
  disconnected = false;

  constructor(callback: IOCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }

  disconnect() {
    this.disconnected = true;
  }

  unobserve() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  fire(ratio: number) {
    const entry = {
      intersectionRatio: ratio,
      isIntersecting: ratio > 0,
      target: this.observed[0],
    } as unknown as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }

  static reset() {
    MockIntersectionObserver.instances = [];
  }

  static current() {
    return MockIntersectionObserver.instances.at(-1);
  }
}

describe("<Reveal>", () => {
  beforeEach(() => {
    MockIntersectionObserver.reset();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    // By default jsdom's matchMedia returns undefined; stub for completeness.
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders children inside a div with the .reveal class", () => {
    render(
      <Reveal>
        <p data-testid="child">hello</p>
      </Reveal>,
    );
    const child = screen.getByTestId("child");
    const wrapper = child.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("reveal");
    expect(wrapper).not.toHaveClass("revealed");
  });

  it("applies .revealed when the IntersectionObserver crosses the threshold after attach (normal path)", () => {
    render(
      <Reveal>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    const io = MockIntersectionObserver.current()!;

    // First callback reports below threshold (element offscreen at attach).
    act(() => io.fire(0));
    expect(wrapper).not.toHaveClass("revealed");

    // User scrolls; element crosses threshold. .revealed applies.
    act(() => io.fire(0.2));
    expect(wrapper).toHaveClass("revealed");
    expect(io.disconnected).toBe(true);
  });

  it("applies .revealed after `delay` ms when the threshold is crossed", () => {
    vi.useFakeTimers();
    render(
      <Reveal delay={120}>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    const io = MockIntersectionObserver.current()!;

    act(() => io.fire(0)); // initial, below threshold
    act(() => io.fire(0.2)); // now crossed
    expect(wrapper).not.toHaveClass("revealed");

    act(() => {
      vi.advanceTimersByTime(119);
    });
    expect(wrapper).not.toHaveClass("revealed");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(wrapper).toHaveClass("revealed");
  });

  it("R24: snaps to revealed with inline `transition: none` when already past threshold at attach", () => {
    render(
      <Reveal>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    const io = MockIntersectionObserver.current()!;

    // First callback: element was already past threshold when observed.
    act(() => io.fire(0.5));
    expect(wrapper).toHaveClass("revealed");
    expect(wrapper.style.transition).toBe("none");
    expect(io.disconnected).toBe(true);
  });

  it("R24: inline `transition: none` is cleared on the next animation frame so future transitions work", async () => {
    render(
      <Reveal>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    const io = MockIntersectionObserver.current()!;

    act(() => io.fire(0.5));
    expect(wrapper.style.transition).toBe("none");

    // Let requestAnimationFrame + React flush the transition clear.
    await act(async () => {
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null)),
      );
    });
    expect(wrapper.style.transition).toBe("");
  });

  it("R25: keyboard focus (:focus-visible) on a descendant snaps to revealed", () => {
    render(
      <Reveal>
        <button data-testid="focusable">click</button>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("focusable").parentElement!;
    const io = MockIntersectionObserver.current()!;

    // Not yet revealed — still below threshold in observer.
    act(() => io.fire(0));
    expect(wrapper).not.toHaveClass("revealed");

    // Simulate keyboard focus. jsdom's :focus-visible is finicky —
    // stub matches() to report :focus-visible on the button.
    const button = screen.getByTestId("focusable");
    const originalMatches = button.matches.bind(button);
    button.matches = (selector: string) =>
      selector === ":focus-visible" ? true : originalMatches(selector);

    act(() => {
      fireEvent.focusIn(button);
    });
    expect(wrapper).toHaveClass("revealed");
    expect(io.disconnected).toBe(true);
  });

  it("R33: bfcache restore via pageshow[persisted] snaps to revealed", () => {
    render(
      <Reveal>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;

    // Simulate bfcache restore — fire a pageshow event with persisted: true.
    const event = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(event, "persisted", { value: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(wrapper).toHaveClass("revealed");
  });

  it("falls back to revealed immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <Reveal>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper).toHaveClass("revealed");
  });

  it("controlled mode: when `revealed` prop is true, applies .revealed and does not attach an observer", () => {
    render(
      <Reveal revealed={true}>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper).toHaveClass("revealed");
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("controlled mode: `revealed` prop flip from false to true applies .revealed with animation (no instant)", () => {
    const { rerender } = render(
      <Reveal revealed={false}>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper).not.toHaveClass("revealed");
    expect(wrapper.style.transition).toBe("");

    rerender(
      <Reveal revealed={true}>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    expect(wrapper).toHaveClass("revealed");
    expect(wrapper.style.transition).toBe("");
  });

  it("controlled mode with `instant`: snap with inline transition: none", () => {
    render(
      <Reveal revealed={true} instant={true}>
        <p data-testid="child">hi</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper).toHaveClass("revealed");
    expect(wrapper.style.transition).toBe("none");
  });

  it("Strict Mode: renders one active IntersectionObserver at steady state despite double-invocation", () => {
    render(
      <StrictMode>
        <Reveal>
          <p data-testid="child">hi</p>
        </Reveal>
      </StrictMode>,
    );
    // Strict Mode double-invokes: 2 instances created, 1 disconnected.
    // The important invariant is one *live* observer remains.
    const instances = MockIntersectionObserver.instances;
    const live = instances.filter((i) => !i.disconnected);
    expect(live).toHaveLength(1);
  });
});
