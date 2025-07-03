import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $vScrollReveal: {
      sync: () => void;
    };
  }
} 