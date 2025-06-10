<template>
  <div class="app-wrapper">
    <Header />
    <main class="app-content">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-content {
  flex: 1;
}
</style>
