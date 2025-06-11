<template>
    <section class="blog-post container" v-if="post">
      <NuxtLink to="/blog">← Назад к списку</NuxtLink>
      <h1>{{ post.title }}</h1>
      <time>{{ post.date }}</time>
      <div class="post-content" v-html="post.content"></div>
    </section>
    <p v-else class="not-found">Пост не найден.</p>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { posts, type Post } from '@/data/posts'
  
  const route = useRoute()
  const router = useRouter()
  const post = ref<Post|null>(null)
  
  onMounted(() => {
    const slug = route.params.slug as string
    post.value = posts.find(p => p.slug === slug) || null
    if (!post.value) router.replace('/blog')
  })
  </script>
  
  <style lang="scss" scoped>
  .blog-post {
    padding: 4rem 0;
    a { display: inline-block; margin-bottom: 1rem; }
    h1 {
      font-size: 2rem;
      margin-bottom: .5rem;
    }
    time {
      display: block;
      color: var(--secondary);
      margin-bottom: 1.5rem;
    }
    .post-content {
      line-height: 1.8;
      color: var(--text);
      h2 { margin-top: 1.5rem; }
      table {
        width: 100%;
        border-collapse: collapse;
        th, td {
          border: 1px solid var(--secondary);
          padding: .5rem;
        }
      }
    }
  }
  </style>
  