<template>
<div class="loader2">
  <div class="load21"></div>
  <div class="load22"></div>
  <div class="load23"></div>
  <div class="load24"></div>
  <div class="load25"></div>
</div>
</template>


<style scoped>
.loader2 {
  display: flex;
  align-items: center;
}

.load21 {
  position: relative;
  content: "";
  height: 0.2em;
  width: 4em;
  border-radius: 5px;
  opacity: 0;
  background-color: white;
  box-shadow: 0 1px 7px rgba(0,0,0,0.3);
  animation: 2s flow_21 infinite;
  animation-delay: 0.2s;
}

.load22 {
  position: absolute;
  content: "";
  height: 0.2em;
  width: 4em;
  opacity: 0;
  border-radius: 5px;
  background-color: white;
  animation: 2s flow_21 infinite;
  animation-delay: 0.4s;
}

.load23 {
  position: absolute;
  content: "";
  height: 0.2em;
  width: 4em;
  opacity: 0;
  border-radius: 5px;
  background-color: white;
  animation: 2s flow_21 infinite;
  animation-delay: 0.6s;
}

.load24 {
  position: absolute;
  content: "";
  height: 0.2em;
  width: 4em;
  opacity: 0;
  border-radius: 5px;
  background-color: white;
  animation: 2s flow_21 infinite;
  animation-delay: 0.8s;
}

.load25 {
  position: absolute;
  content: "";
  height: 0.2em;
  width: 4em;
  opacity: 0;
  border-radius: 5px;
  background-color: white;
  animation: 2s flow_21 infinite;
  animation-delay: 1s;
}

@keyframes flow_21 {
  0% {
    transform: translateY(1em);
    opacity: 1;
  }

  50% {
    transform: translateY(-1em);
    opacity: 1;
  }

  100% {
    transform: translateY(1em);
    opacity: 1;
  }
}
</style>