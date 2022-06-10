<script setup lang="ts">
import { LockClosedIcon } from "@heroicons/vue/solid";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import "firebase/firestore";
import "firebase/auth";
import { ref, Ref, inject, onMounted, provide } from "vue";
import NotVerified from "@/components/NotVerified.vue";
import {
  getAllProducts,
  getAllDownlines,
  getMemberInfo,
  getAllCarousels,
  getCommissionInfo,
} from "@/store/firebaseControl";

const router = useRouter();
const store = useStore();

//----data ref ----
const isShowMask: Ref<boolean> = inject("isShowMask") as Ref<boolean>;
const isVeriflyInfoFormOpen = ref(false);
const currentMember: any = ref({});
const email = ref("admin001");
const password = ref("123456");

provide("isVeriflyInfoFormOpen", isVeriflyInfoFormOpen);
provide("currentMember", currentMember);

onMounted(async () => {
  store.commit("setClear");
});

async function login() {
  if (email.value == "" || password.value == "") {
    alert("請輸入帳號、密碼");
    return;
  }
  isShowMask.value = true;

  currentMember.value = (await getMemberInfo(
    email.value,
    password.value
  )) as any;

  if (!checkMemberValid()) {
    isShowMask.value = false;
    return;
  }
  console.log("currentMember.value.account:", currentMember.value.account);
  store.commit("setUserInfo", {
    account: currentMember.value.account,
    docId: currentMember.value.docId,
    ancestors: currentMember.value.ancestors,
    nickname: currentMember.value.nickname,
    urlsuffix: currentMember.value.urlsuffix,
    commissionPercentage: currentMember.value.commissionPercentage,
    registerDatetime: currentMember.value.registerDatetime,
    depth: currentMember.value.depth,
    parent: currentMember.value.parent,
    role: currentMember.value.role,
    qrCodeUrl: currentMember.value.qrcode,
  });

  let results = await Promise.all([
    getAllProducts(),
    getAllDownlines(store.state.userInfo.urlsuffix),
    getAllCarousels(),
    getCommissionInfo(),
  ]);
  var allProducts = await results[0];
  store.commit("setAllProducts", allProducts);
  //取得下面層數的下線,depth=-1代表全部 2代表幾層
  var downlines: any = await results[1];

  if (downlines.length > 0) {
    console.log("downlines", downlines);
    downlines.forEach((downline: any) => {
      store.commit("setDownline", downline);
    });
  }

  let allCarousels = results[2];
  console.log(results);
  store.commit("setAllCarousels", allCarousels);

  let commissionInfo = results[3];
  store.commit("setCommissionInfo", commissionInfo);

  router.push("/home");
  isShowMask.value = false;
}

function checkMemberValid() {
  if (currentMember.value == null) {
    alert("帳號或密碼錯誤");
    return false;
  }
  if (currentMember.value.isLocked) {
    alert("帳號鎖定中，請聯繫客服人員");
    return false;
  }

  switch (currentMember.value.verifiedStatus) {
    case -1:
      alert("帳號驗證失敗，請聯繫客服人員");
      return false;

    case 0:
      // alert("帳號尚未驗證");
      isVeriflyInfoFormOpen.value = true;
      return false;

    case 1:
      // alert("帳號驗證成功");
      return true;

    case 2:
      alert("帳號驗證中");
      return false;
  }
}
</script>

<template>
  <div class="items-center justify-center w-full h-screen">
    <NotVerified />
    <div
      class="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-md space-y-8">
        <div>
          <img
            class="w-auto h-12 mx-auto"
            src="https://cdn.shopify.com/s/files/1/0567/7393/5146/files/0fb0db42c116c08666f42cebc91e4524_ee2e4e41-4068-465e-b618-e829553d8153.png?v=1652952172"
            alt="Workflow"
          />
          <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">
            登入頁面
          </h2>
        </div>
        <form class="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" value="true" />
          <div class="-space-y-px rounded-md shadow-sm">
            <div>
              <label class="sr-only">Email address</label>
              <input
                type="email"
                autocomplete="email"
                required
                class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="電子郵件"
                v-model="email"
              />
            </div>
            <div>
              <label class="sr-only">Password</label>
              <input
                type="password"
                autocomplete="current-password"
                required
                class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密碼"
                v-model="password"
              />
            </div>
          </div>
        </form>
        <div @click="login">
          <button
            type="submit"
            class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <LockClosedIcon
                class="w-5 h-5 text-indigo-500 group-hover:text-indigo-400"
                aria-hidden="true"
              />
            </span>
            登入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
