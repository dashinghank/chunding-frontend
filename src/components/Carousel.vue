<script setup>
import { onMounted, ref, nextTick } from "vue";
import gsap from "gsap";
import { getFirestore, getDocs, collection } from "firebase/firestore";

const db = getFirestore();

//----data ref----
const carousels = ref([]);

//----element ref----
const carouselRoot = ref();
const carouselItem = ref();

onMounted(async () => {
  let carouselsQuery = await getDocs(collection(db, "carousels"));
  carouselsQuery.forEach((d) => {
    carousels.value.push(d.data());
  });

  nextTick(() => {
    let tl = gsap.timeline({ repeat: -1, repeatDelay: 40 });

    tl.set(carouselItem.value, {
      x: carouselItem.value.clientWidth,
    });

    tl.to(carouselRoot.value, { opacity: 100, duration: 1 });

    tl.to(carouselItem.value, {
      duration: 25,
      x: -carouselItem.value.clientWidth,
      ease: "none",
    });

    tl.to(carouselRoot.value, { opacity: 0, duration: 1 });
  });
});
</script>
<template>
  <div
    class="w-full h-5 overflow-hidden transition-opacity bg-gray-50"
    style="opacity: 0"
    ref="carouselRoot"
  >
    <div ref="carouselItem" class="flex gap-[200px] w-fit whitespace-nowrap">
      <div v-for="(carousel, index) in carousels" :key="index">
        {{ carousel.msg }}
      </div>
    </div>
  </div>
</template>
