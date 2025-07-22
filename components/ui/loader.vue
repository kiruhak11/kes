<template>
  <div class="loader-wrapper">
    <span class="loader-letter">Ф</span>
    <span class="loader-letter">О</span>
    <span class="loader-letter">Р</span>
    <span class="loader-letter">М</span>
    <span class="loader-letter">И</span>
    <span class="loader-letter">Р</span>
    <span class="loader-letter">О</span>
    <span class="loader-letter">В</span>
    <span class="loader-letter">А</span>
    <span class="loader-letter">Н</span>
    <span class="loader-letter">И</span>
    <span class="loader-letter">Е</span>
    <div class="loader"></div>
  </div>
</template>

<style lang="scss" scoped>
.loader-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  width: auto;
  margin: 2rem;

  font-family: "Poppins", sans-serif;
  font-size: 1.6em;
  font-weight: 600;
  user-select: none;
  color: #e31e24;

  scale: 2;
}

.loader {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 1;

  background-color: transparent;
  mask: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 6px,
    black 7px,
    black 8px
  );
}

.loader::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-image:
    radial-gradient(circle at 50% 50%, rgb(255, 0, 85) 0%, transparent 50%),
    radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
    radial-gradient(circle at 55% 55%, rgb(255, 145, 0) 0%, transparent 45%),
    radial-gradient(circle at 45% 55%, rgb(172, 34, 0) 0%, transparent 45%),
    radial-gradient(circle at 55% 45%, rgb(232, 68, 68) 0%, transparent 45%);
  mask: radial-gradient(
    circle at 50% 50%,
    transparent 0%,
    transparent 10%,
    black 25%
  );
  animation:
    transform-animation 2s infinite alternate,
    opacity-animation 4s infinite;
  animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
}

@keyframes transform-animation {
  0% {
    transform: translate(-55%);
  }
  100% {
    transform: translate(55%);
  }
}

@keyframes opacity-animation {
  0%,
  100% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  65% {
    opacity: 0;
  }
}

.loader-letter {
  display: inline-block;
  opacity: 0;
  animation: loader-letter-anim 4s infinite linear;
  z-index: 2;
}

.loader-letter:nth-child(1) {
  animation-delay: 0.1s;
}
.loader-letter:nth-child(2) {
  animation-delay: 0.205s;
}
.loader-letter:nth-child(3) {
  animation-delay: 0.31s;
}
.loader-letter:nth-child(4) {
  animation-delay: 0.415s;
}
.loader-letter:nth-child(5) {
  animation-delay: 0.521s;
}
.loader-letter:nth-child(6) {
  animation-delay: 0.626s;
}
.loader-letter:nth-child(7) {
  animation-delay: 0.731s;
}
.loader-letter:nth-child(8) {
  animation-delay: 0.837s;
}
.loader-letter:nth-child(9) {
  animation-delay: 0.942s;
}
.loader-letter:nth-child(10) {
  animation-delay: 1.047s;
}

.loader-letter:nth-child(11) {
  animation-delay: 1.127s;
}

.loader-letter:nth-child(12) {
  animation-delay: 1.207s;
}

@keyframes loader-letter-anim {
  0% {
    opacity: 0;
  }
  5% {
    opacity: 1;
    text-shadow: 0 0 4px #fff;
    transform: scale(1.1) translateY(-2px);
  }
  20% {
    opacity: 0.2;
  }
  100% {
    opacity: 0;
  }
}
</style>
