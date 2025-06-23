import type { DirectiveBinding } from 'vue';

const animateClass = 'scroll-reveal-animate';

const ScrollReveal = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const animation = binding.value || 'fade-in-up';
    el.classList.add('scroll-reveal');
    el.classList.add(`scroll-reveal--${animation}`);
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          el.classList.add(animateClass);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    (el as any).__scrollRevealObserver = observer;
  },
  unmounted(el: HTMLElement) {
    const observer = (el as any).__scrollRevealObserver;
    if (observer) observer.disconnect();
  },
};

export default ScrollReveal; 