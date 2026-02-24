import 'vue'

declare global {
  function ym(counterId: number, method: string, ...args: any[]): void;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $vScrollReveal: {
      sync: () => void;
    };
  }
} 
