import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RevealGroup } from "@/components/reveal-group";

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

function stubFontsReady(resolveAfterMs?: number) {
  const ready =
    resolveAfterMs === undefined
      ? Promise.resolve()
      : new Promise<void>((resolve) => setTimeout(resolve, resolveAfterMs));
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready },
  });
  return ready;
}

describe("<RevealGroup>", () => {
  beforeEach(() => {
    MockIntersectionObserver.reset();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    sessionStorage.clear();
    // Restore document.fonts if we overrode it.
    try {
      delete (document as unknown as { fonts?: unknown }).fonts;
    } catch {
      /* ignore */
    }
    // Restore window.scrollY if we overrode it.
    try {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 0,
      });
    } catch {
      /* ignore */
    }
  });

  describe("scroll mode", () => {
    it("renders each child wrapped in a .reveal div inside the group container", () => {
      render(
        <RevealGroup mode="scroll" className="grid">
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
          <p data-testid="c3">three</p>
        </RevealGroup>,
      );
      const container = screen.getByTestId("c1").closest(".grid");
      expect(container).not.toBeNull();
      expect(container!.querySelectorAll(".reveal")).toHaveLength(3);
    });

    it("cascades children with staggerMs delay on threshold crossing", () => {
      vi.useFakeTimers();
      render(
        <RevealGroup mode="scroll" staggerMs={50}>
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
          <p data-testid="c3">three</p>
        </RevealGroup>,
      );
      const wrappers = [
        screen.getByTestId("c1").parentElement!,
        screen.getByTestId("c2").parentElement!,
        screen.getByTestId("c3").parentElement!,
      ];
      const io = MockIntersectionObserver.current()!;

      // Initial observer callback fires below threshold — no reveal yet.
      act(() => io.fire(0));
      expect(wrappers[0]).not.toHaveClass("revealed");

      // User scrolls; group's sentinel crosses threshold.
      act(() => io.fire(0.2));
      // Delays scheduled: 0, 50, 100
      act(() => vi.advanceTimersByTime(0));
      expect(wrappers[0]).toHaveClass("revealed");
      expect(wrappers[1]).not.toHaveClass("revealed");

      act(() => vi.advanceTimersByTime(50));
      expect(wrappers[1]).toHaveClass("revealed");
      expect(wrappers[2]).not.toHaveClass("revealed");

      act(() => vi.advanceTimersByTime(50));
      expect(wrappers[2]).toHaveClass("revealed");
    });

    it("scroll-mode always animates on threshold crossing (even when already past threshold at mount)", () => {
      // Unlike individual <Reveal>, RevealGroup scroll-mode does not snap
      // instantly when its sentinel is already past threshold at mount.
      // The group's container often spans multiple children with most
      // still below the fold — snapping would hide the visible cascade.
      vi.useFakeTimers();
      render(
        <RevealGroup mode="scroll" staggerMs={80}>
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
          <p data-testid="c3">three</p>
        </RevealGroup>,
      );
      const wrappers = [
        screen.getByTestId("c1").parentElement!,
        screen.getByTestId("c2").parentElement!,
        screen.getByTestId("c3").parentElement!,
      ];
      const io = MockIntersectionObserver.current()!;

      // First callback: already past threshold. Should still animate with
      // staggered delays (no instant snap).
      act(() => io.fire(0.5));
      act(() => vi.advanceTimersByTime(0));
      expect(wrappers[0]).toHaveClass("revealed");
      expect(wrappers[0].style.transition).toBe("");
      expect(wrappers[1]).not.toHaveClass("revealed");

      act(() => vi.advanceTimersByTime(80));
      expect(wrappers[1]).toHaveClass("revealed");
      act(() => vi.advanceTimersByTime(80));
      expect(wrappers[2]).toHaveClass("revealed");
    });

    it("rowGroups=[3,3,1] produces 3+3+1 staggered delays with row-start stride", () => {
      vi.useFakeTimers();
      const children = Array.from({ length: 7 }, (_, i) => (
        <p key={i} data-testid={`c${i}`}>
          item {i}
        </p>
      ));
      render(
        <RevealGroup
          mode="scroll"
          staggerMs={70}
          rowGapMs={160}
          rowGroups={[3, 3, 1]}
        >
          {children}
        </RevealGroup>,
      );
      const wrappers = Array.from(
        { length: 7 },
        (_, i) => screen.getByTestId(`c${i}`).parentElement!,
      );
      const io = MockIntersectionObserver.current()!;

      // Initial below threshold, then cross.
      act(() => io.fire(0));
      act(() => io.fire(0.2));

      // Row 1 (start = 0): cards 0, 1, 2 at 0, 70, 140.
      act(() => vi.advanceTimersByTime(0));
      expect(wrappers[0]).toHaveClass("revealed");
      act(() => vi.advanceTimersByTime(70));
      expect(wrappers[1]).toHaveClass("revealed");
      act(() => vi.advanceTimersByTime(70));
      expect(wrappers[2]).toHaveClass("revealed");
      expect(wrappers[3]).not.toHaveClass("revealed");

      // Row 2 (start = 160): cards 3, 4, 5 at 160, 230, 300. We're now at 140.
      act(() => vi.advanceTimersByTime(20)); // to 160
      expect(wrappers[3]).toHaveClass("revealed");
      act(() => vi.advanceTimersByTime(70)); // to 230
      expect(wrappers[4]).toHaveClass("revealed");
      act(() => vi.advanceTimersByTime(70)); // to 300
      expect(wrappers[5]).toHaveClass("revealed");
      expect(wrappers[6]).not.toHaveClass("revealed");

      // Row 3 (start = 320): card 6. Advance to 320.
      act(() => vi.advanceTimersByTime(20));
      expect(wrappers[6]).toHaveClass("revealed");
    });

    it("R30: delays are captured at first render and do not recompute when staggerMs prop changes", () => {
      vi.useFakeTimers();
      const { rerender } = render(
        <RevealGroup mode="scroll" staggerMs={50}>
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
        </RevealGroup>,
      );

      // Rerender with a different staggerMs — delays should stay at 50.
      rerender(
        <RevealGroup mode="scroll" staggerMs={500}>
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
        </RevealGroup>,
      );

      const wrappers = [
        screen.getByTestId("c1").parentElement!,
        screen.getByTestId("c2").parentElement!,
      ];
      const io = MockIntersectionObserver.current()!;
      act(() => io.fire(0));
      act(() => io.fire(0.2));

      act(() => vi.advanceTimersByTime(50));
      // Delay for child 1 was locked at 50ms — reveal fired.
      expect(wrappers[1]).toHaveClass("revealed");
    });
  });

  describe("hero mode", () => {
    it("fires the cascade after document.fonts.ready + rAF", async () => {
      stubFontsReady(0);
      render(
        <RevealGroup mode="hero" sessionKey="test-hero" staggerMs={50}>
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
        </RevealGroup>,
      );
      const wrappers = [
        screen.getByTestId("c1").parentElement!,
        screen.getByTestId("c2").parentElement!,
      ];

      // Flush fonts.ready + rAF + first stagger timeout.
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        await new Promise((r) => setTimeout(r, 60));
      });

      expect(wrappers[0]).toHaveClass("revealed");
      expect(wrappers[1]).toHaveClass("revealed");
      expect(sessionStorage.getItem("hero-cascade:test-hero")).toBe("seen");
    });

    it("sessionStorage guard: second mount with same sessionKey snaps instantly", async () => {
      sessionStorage.setItem("hero-cascade:test-hero", "seen");
      stubFontsReady(0);

      render(
        <RevealGroup mode="hero" sessionKey="test-hero" staggerMs={50}>
          <p data-testid="c1">one</p>
        </RevealGroup>,
      );
      const wrapper = screen.getByTestId("c1").parentElement!;

      // No font-ready wait needed — snaps synchronously via the effect.
      await act(async () => {});

      expect(wrapper).toHaveClass("revealed");
      expect(wrapper.style.transition).toBe("none");
    });

    it("R27: non-zero window.scrollY at trigger time snaps instead of cascading", async () => {
      stubFontsReady(0);
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 500,
      });

      render(
        <RevealGroup mode="hero" sessionKey="scroll-restored" staggerMs={50}>
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
        </RevealGroup>,
      );
      const wrappers = [
        screen.getByTestId("c1").parentElement!,
        screen.getByTestId("c2").parentElement!,
      ];

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      });

      wrappers.forEach((w) => {
        expect(w).toHaveClass("revealed");
        expect(w.style.transition).toBe("none");
      });

      // Reset scrollY for other tests
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 0,
      });
    });

    it("fires at the 300ms fallback when document.fonts.ready never resolves", async () => {
      vi.useFakeTimers();
      // Stub a never-resolving fonts.ready.
      Object.defineProperty(document, "fonts", {
        configurable: true,
        value: { ready: new Promise(() => {}) },
      });

      render(
        <RevealGroup mode="hero" sessionKey="slow-font" staggerMs={50}>
          <p data-testid="c1">one</p>
        </RevealGroup>,
      );
      const wrapper = screen.getByTestId("c1").parentElement!;

      // Advance past the 300ms fallback and allow rAF + first timeout to flush.
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      await act(async () => {
        // Let microtasks queue the rAF callback
        await Promise.resolve();
      });
      await act(async () => {
        vi.advanceTimersByTime(16); // a frame
      });
      await act(async () => {
        vi.advanceTimersByTime(0);
      });

      expect(wrapper).toHaveClass("revealed");
    });
  });

  describe("bfcache restore", () => {
    it("R33: pageshow[persisted] snaps all children to revealed", () => {
      render(
        <RevealGroup mode="scroll">
          <p data-testid="c1">one</p>
          <p data-testid="c2">two</p>
        </RevealGroup>,
      );
      const wrappers = [
        screen.getByTestId("c1").parentElement!,
        screen.getByTestId("c2").parentElement!,
      ];

      const event = new Event("pageshow") as PageTransitionEvent;
      Object.defineProperty(event, "persisted", { value: true });
      act(() => {
        window.dispatchEvent(event);
      });

      wrappers.forEach((w) => expect(w).toHaveClass("revealed"));
    });
  });
});
