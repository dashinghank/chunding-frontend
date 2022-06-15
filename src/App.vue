<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Mask from "@/components/Mask.vue";
import { useStore } from "vuex";
import { onMounted, provide, ref } from "vue";
import {
  getAllProducts,
  getAllDownlines,
  getAllCarousels,
  getCommissionInfo,
} from "@/store/firebaseControl";
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
    //將 shopify 的訂單資料 update 到 firebase, 使用者無須等候
    axios.post("https://shopify-api-nine.vercel.app/api/updateAllOrders", {
      //true的話就是無論如何都會更新
      withoutdelay: true,
    });

    let currentUser = store.state.userInfo;

    // 現在已有使用者登入且不再登入頁面，重新整理時更新資料
    if (currentUser.urlsuffix != "" && route.name != "Login") {
      let allPromises = [
        getAllDownlines(store.state.userInfo.urlsuffix),
        getAllCarousels(),
        getCommissionInfo(),
      ];

      let results = await Promise.all(allPromises);
      var downlines = results[0];
      if (downlines.length > 0) {
        downlines.forEach((downline: any) => {
          store.commit("setDownline", downline);
        });
      }

      let allCarousels = results[1];
      store.commit("setAllCarousels", allCarousels);

      let commissionInfo = results[2];
      store.commit("setCommissionInfo", commissionInfo);
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
    <Navbar
      class="fixed top-0 w-full z-50"
      v-if="store.state.userInfo.urlsuffix != '' && route.name != 'Login'"
    />

    <div class="fixed z-10 w-16 right-5 bottom-5">
      <div
        class="absolute top-[-325px] border border-black rounded-lg p-2 py-5 w-40 h-fit right-0 bg-white"
        v-if="open"
      >
        <div class="text-xs">
          <div>掃碼聯絡客服</div>
          <div>
            <img
              class="w-full"
              src="https://cdn.shopify.com/s/files/1/0567/7393/5146/files/cd-line.png?v=1653536955"
            />
          </div>

          <div class="py-3">
            Line :
            <a
              class="text-blue-600 underline hover:text-blue-800 visited:text-purple-600"
              href="https://lin.ee/napnbUF"
              >https://lin.ee/napnbUF</a
            >
          </div>
          <div>
            Mail :
            <a
              class="text-blue-600 underline hover:text-blue-800 visited:text-purple-600"
              href="mailto:chundingbio@gmail.com"
              >chundingbio@gmail.com</a
            >
          </div>
        </div>
      </div>
      <div
        class="w-full p-3 bg-yellow-200 rounded-full cursor-pointer"
        @click="open = !open"
      >
        <!-- Generator: Adobe Illustrator 18.1.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        <svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          fill="#333"
          viewBox="0 0 361.014 361.014"
          style="enable-background: new 0 0 361.014 361.014"
          xml:space="preserve"
        >
          <g>
            <g id="Layer_5_47_">
              <path
                d="M331.035,126.94H318.01c-3.563,0-3.682-2.333-3.805-3.494C307.375,59.094,252.77,8.791,186.637,8.791h-12.26
			c-65.644,0-119.929,49.56-127.409,113.229c-0.191,1.631-0.291,4.92-3.291,4.92H29.978C20.987,126.94,0,136.401,0,184.18v25.075
			c0,35.436,20.987,43.609,29.978,43.609h43.584c8.991,0,16.347-7.356,16.347-16.347v-93.23c0-8.991-7.356-16.347-16.347-16.347
			c0,0-2.052-0.18-1.529-3.835c7.192-50.319,50.129-89.313,102.344-89.313h12.26c51.86,0,94.912,38.418,102.2,88.288
			c0.235,1.608,1.111,4.86-1.385,4.86c-8.991,0-16.347,7.356-16.347,16.347v93.23c0,8.991,7.356,16.347,16.347,16.347h8.184
			c2.25,0,1.868,1.798,1.667,2.704c-6.667,30.104-21.637,64.256-55.238,64.256h-24.889c-2.54,0-3.167-1.861-3.65-2.743
			c-4.032-7.367-11.851-12.364-20.841-12.364h-22.933c-13.118,0-23.753,10.634-23.753,23.753c0,13.119,10.635,23.752,23.753,23.752
			h22.933c9.112,0,17.023-5.132,21.005-12.662c0.348-0.658,0.633-2.026,3.321-2.026h25.054c22.823,0,53.365-11.341,69.259-65.373
			c1.694-5.758,3.068-11.496,4.187-17.026c0.154-0.761,0.25-2.27,2.625-2.27h12.9c8.991,0,29.978-8.174,29.978-43.609v-25.075
			C361.013,137.082,340.026,126.94,331.035,126.94z"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>

    <div class="pt-[15vh] pb-[10vh]">
      <router-view />
    </div>

    <div class="fixed bottom-0 left-0 text-xs">v2022.0601.1202</div>
  </div>
</template>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
