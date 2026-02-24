import type { DirectiveBinding } from "vue";

const animateClass = "scroll-reveal-animate";

const ScrollReveal = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const animation = binding.value || "fade-in-up";
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!animation || animation === "false" || prefersReducedMotion) {
      el.classList.add(animateClass);
      return;
    }

    el.classList.add("scroll-reveal");
    el.classList.add(`scroll-reveal--${animation}`);

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add(animateClass);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          el.classList.add(animateClass);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    (el as any).__scrollRevealObserver = observer;
  },
  unmounted(el: HTMLElement) {
    const observer = (el as any).__scrollRevealObserver;
    if (observer && typeof observer.disconnect === "function") {
      observer.disconnect();
    }
  },
};

export default ScrollReveal;
