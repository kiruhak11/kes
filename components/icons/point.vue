<template><div class="loader"></div></template>

<style scoped>
.loader {
  width: 18px;
  height: 18px;
  position: relative;
  transform: rotate(45deg);
  margin-top: -7px;
}

.loader:before,
.loader:after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50% 50% 0 50%;
  background: #0000;
  background-image: radial-gradient(circle 4px at 50% 50%,#0000 94%, #ff4747);
}

.loader:after {
  animation: pulse-ytk0dhmd 1s infinite;
  transform: perspective(336px) translateZ(0px);
}

@keyframes pulse-ytk0dhmd {
  to {
    transform: perspective(336px) translateZ(168px);
    opacity: 0;
  }
}
  

</style>