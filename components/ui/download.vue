<template>
<button class="Btn">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="1em"
    viewBox="0 0 384 512"
    class="svgIcon"
  >
    <path
      d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
    ></path>
  </svg>
  <span class="icon2"></span>
</button>

</template>
<style scoped>
.Btn {
  width: 50px;
  height: 50px;
  border: 2px solid rgb(214, 214, 214);
  border-radius: 15px;
  background-color: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition-duration: 0.3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.11);
}

.svgIcon {
  fill: rgb(70, 70, 70);
}

.icon2 {
  width: 18px;
  height: 5px;
  border-bottom: 2px solid rgb(70, 70, 70);
  border-left: 2px solid rgb(70, 70, 70);
  border-right: 2px solid rgb(70, 70, 70);
}

.Btn:hover {
  background-color: rgb(51, 51, 51);
  transition-duration: 0.3s;
}

.Btn:hover .icon2 {
  border-bottom: 2px solid rgb(235, 235, 235);
  border-left: 2px solid rgb(235, 235, 235);
  border-right: 2px solid rgb(235, 235, 235);
}

.Btn:hover .svgIcon {
  fill: rgb(255, 255, 255);
  animation: slide-in-top 1s linear infinite;
}

@keyframes slide-in-top {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }

  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}

    </style>