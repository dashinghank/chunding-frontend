<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Mask from "@/components/Mask.vue";
import { useStore } from "vuex";
import { onMounted, provide, ref } from "vue";
import { getAllProducts, getAllDownlines } from "@/store/firebaseControl";
import { useRoute } from "vue-router";
import axios from "axios";

const store = useStore();
const route = useRoute();

// ----data ref----
const isShowMask = ref(false);
const shorterUrl = ref("");
const qrCodeUrl = ref("");

provide("isShowMask", isShowMask);
provide("qrCodeUrl", qrCodeUrl);
provide("shorterUrl", shorterUrl);

const open = ref(false);
onMounted(async () => {
  try {
    isShowMask.value = true;
    //將 shopify 的訂單資料 update 到 firebase
    await axios.post(
      "https://shopify-api-nine.vercel.app/api/updateAllOrders",
      {
        withoutdelay: false,
      }
    );

    let currentUser = store.state.userInfo;

    // 現在已有使用者登入且不再登入頁面，重新整理時更新資料
    if (currentUser.urlsuffix != "" && route.name != "Login") {
      var allProducts = await getAllProducts();
      store.commit("setAllProducts", allProducts);

      var downlines: any = await getAllDownlines(
        [{ urlsuffix: store.state.userInfo.urlsuffix }],
        store.state.userInfo.role == "admin" ? -1 : 2
      );

      if (downlines.length > 0) {
        downlines.forEach((downline: any) => {
          store.commit("setDownline", downline);
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
  <div class="relative min-w-full min-h-screen">
    <Mask />
    <Navbar class="w-full" v-if="store.state.userInfo.urlsuffix != ''" />

    <div class="fixed right-5 bottom-5">
      <div v-if="open">客服 Line ID</div>
      <div @click="open = !open">點擊查看客服資訊</div>
    </div>
    <router-view />
  </div>
</template>

<style></style>
