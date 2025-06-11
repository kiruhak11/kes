<template>
    <section class="blog-list container">
      <h1>Блог</h1>
      <ul>
        <li v-for="post in posts" :key="post.slug" class="post-item">
          <NuxtLink :to="`/blog/${post.slug}`" class="post-link">
            <h2>{{ post.title }}</h2>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            <time>{{ post.date }}</time>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </template>
  
  <script setup lang="ts">
  import { posts } from '@/data/posts'
  </script>
  
  <style lang="scss" scoped>
  .blog-list {
    padding: 4rem 0;
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--text);
    }
    ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 1.5rem;
    }
    .post-item {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      border-radius: .75rem;
      padding: 1.5rem;
      transition: transform .2s;
      &:hover {
        transform: translateY(-4px);
      }
    }
    .post-link {
      text-decoration: none;
      color: inherit;
      h2 {
        margin-bottom: .5rem;
        font-size: 1.5rem;
      }
      .post-excerpt {
        color: var(--secondary);
        margin-bottom: .5rem;
      }
      time {
        font-size: .875rem;
        color: var(--secondary);
      }
    }
  }
  </style>
  