<template>
    <div class="notifications-container">
  <div class="error-alert">
    <div class="flex">
      <div class="flex-shrink-0">
        
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
          <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill-rule="evenodd"></path>
        </svg>
      </div>
      <div class="error-prompt-container">
        <p class="error-prompt-heading">Для использования админ панели, вам необходимо авторизоваться
        </p><div class="error-prompt-wrap">
          <ul class="error-prompt-list" role="list">
            <li>Если вы не администратор, пожалуйста, не используйте эту страницу</li>
            <li>Если вы администратор, пожалуйста, авторизуйтесь</li>
          </ul>
      </div>
      </div>
    </div>
  </div>
</div>
</template>
<style scoped>
.notifications-container {
  width: 320px;
  height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flex {
  display: flex;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.error-alert {
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: rgb(254 242 242);
}

.error-svg {
  color: #F87171;
  width: 1.25rem;
  height: 1.25rem;
}

.error-prompt-heading {
  color: #991B1B;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: bold;
}

.error-prompt-container {
  display: flex;
  flex-direction: column;
  margin-left: 1.25rem;
}

.error-prompt-wrap {
  margin-top: 0.5rem;
  color: #B91C1C;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.error-prompt-list {
  padding-left: 1.25rem;
  margin-top: 0.25rem;
  list-style-type: disc;
}
</style>