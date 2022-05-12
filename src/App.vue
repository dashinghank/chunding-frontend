<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Mask from "@/components/Mask.vue";
import { useStore } from "vuex";
import { onMounted, provide, ref } from "vue";
import { getAllProducts, getAllDownlines } from "@/store/firebaseControl";
import { useRouter, useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
const isShowMask = ref(false);
provide("isShowMask", isShowMask);

onMounted(async () => {
  try {
    isShowMask.value = true;

    await fetch("https://shopify-api-nine.vercel.app/api/updateAllOrders");

    if (store.state.userInfo.urlsuffix != "" && route.name != "Login") {
      var allProducts = await getAllProducts();
      store.commit("setAllProducts", allProducts);
      var downlines: any = await getAllDownlines(
        [{ urlsuffix: store.state.userInfo.urlsuffix }],
        store.state.userInfo.role == "admin" ? -1 : 2
      );
      if (downlines.length > 0) {
        downlines.forEach((downline: any) => {
          store.commit("setDownlines", downline);
        });
      }
    }

    isShowMask.value = false;
  } catch (e) {
    console.log(e);
  }
});
</script>

<template>
  <!-- <HelloWorld /> -->
  <Mask />
  <Navbar class="w-full" v-if="store.state.userInfo.urlsuffix != ''" />
  <router-view />
</template>

<style></style>
