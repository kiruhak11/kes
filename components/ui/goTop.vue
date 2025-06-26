<template>
<button class="button">
  <svg viewBox="0 0 384 512" class="svgIcon">
    <path
      d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
    ></path>
  </svg>
</button>

</template>

<style scoped>
/* From Uiverse.io by vinodjangid07 */
.button {
  z-index: 1000;
  width: 50px;
  height: 50px;
  border-radius: 20%;
  background-color: #1b4552;
  border: none;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px double #e9e9e9;
  border-radius: 15px;
  cursor: pointer;
  transition-duration: 0.3s;
  overflow: hidden;
  position: relative;
}

.svgIcon {
  width: 12px;
  transition-duration: 0.3s;
}

.svgIcon path {
  fill: #e9e9e9;
}

.button:hover {
  width: 100px;
  border-radius: 15px;
  transition-duration: 0.3s;
  background-color: #1b4552;
  align-items: center;
}

.button:hover .svgIcon {
  /* width: 20px; */
  transition-duration: 0.3s;
  transform: translateY(-200%);
}

.button::before {
  position: absolute;
  bottom: -20px;
  content: "Наверх";
  color: #e9e9e9;
  /* transition-duration: .3s; */
  font-size: 0px;
}

.button:hover::before {
  font-family: Garet;
  font-size: 15px;
  opacity: 1;
  bottom: unset;
  /* transform: translateY(-30px); */
  transition-duration: 0.3s;
}

</style>