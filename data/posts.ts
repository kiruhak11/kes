export interface Post {
    slug: string
    title: string
    excerpt: string
    content: string
    date: string
  }
  
  export const posts: Post[] = [
    {
      slug: 'vvedenie-v-energoeffektivnost',
      title: 'Введение в энергоэффективность котлов',
      excerpt: 'Почему энергоэффективность критична для современных предприятий...',
      content: `
  ## Что такое энергоэффективность?
  Энергоэффективность – это соотношение полезной отдачи системы к затрачиваемой энергии...
  
  ## Основные методы повышения
  1. Оптимизация горения...
  2. Теплоизоляция котельного оборудования...
  `,
      date: '2025-06-01'
    },
    {
      slug: 'obzor-promyshlennyh-kotlov',
      title: 'Обзор промышленных котлов 2025',
      excerpt: 'Топ-5 котлов для крупных предприятий по версии наших экспертов...',
      content: `
  | Модель       | Мощность | КПД  |
  |--------------|----------|------|
  | KO-15        | 150 кВт  | 92%  |
  | VEZUVII-30   | 300 кВт  | 90%  |
  ...
  `,
      date: '2025-05-20'
    }
  ]
  