<script setup>
import { onMounted, ref } from "vue";
import gsap from "gsap";
import { getFirestore, getDocs, collection } from "firebase/firestore";

const carouselRoot = ref();
const carouselItem = ref();
const db = getFirestore();

onMounted(async () => {
  let carouselsQuery = await getDocs(collection(db, "carousels"));
  let carousels = [];
  carouselsQuery.forEach((d) => {
    carousels.push(d.data());
  });

  let tl = gsap.timeline({ repeat: -1, repeatDelay: 5 });

  tl.to(carouselRoot.value, { opacity: 100, duration: 1 });
  for (let i = 0; i < carousels.length; i++) {
    tl.set(carouselItem.value, {
      x: window.innerWidth + carouselItem.value.clientWidth,
    });
    tl.call(() => {
      console.log(carouselItem.value.innerText);
      carouselItem.value.innerText = carousels[i].msg;
    });
    tl.to(carouselItem.value, {
      duration: 5,
      x: -carouselItem.value.clientWidth,
      ease: "none",
    });
  }
  tl.to(carouselRoot.value, { opacity: 0, duration: 1 });
});
</script>
<template>
  <div
    class="w-full h-5 overflow-hidden transition-opacity bg-gray-50"
    style="opacity: 0"
    ref="carouselRoot"
  >
    <div ref="carouselItem" class="w-fit">asdasdasdasdasdasd</div>
  </div>
</template>
