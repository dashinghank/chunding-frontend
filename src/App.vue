<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Mask from "@/components/Mask.vue";
import HelloWorld from "@/components/HelloWorld.vue";
import { useStore } from "vuex";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { onMounted, provide, ref } from "vue";

const store = useStore();
const db = getFirestore();

const isShowMask = ref(false);
provide("isShowMask", isShowMask);

onMounted(async () => {
  try {
    isShowMask.value = true;
    let result = await fetch(
      "https://shopify-api-nine.vercel.app/api/updateAllOrders"
    );
    isShowMask.value = false;
    console.log(result);
  } catch (e) {
    console.log(e);
  }
});
</script>

<template>
  <!-- <HelloWorld /> -->
  <Mask />
  <Navbar
    class="absolute top-0 w-full"
    v-if="store.state.userInfo.urlsuffix != ''"
  />
  <router-view />
</template>

<style></style>
