import { defineNuxtPlugin } from 'nuxt/app';
import ScrollReveal from '@/directives/scrollReveal';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('scroll-reveal', ScrollReveal);
}); 