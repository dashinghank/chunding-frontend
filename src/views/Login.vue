<script setup lang="ts">
import { LockClosedIcon } from "@heroicons/vue/solid";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import "firebase/firestore";
import "firebase/auth";
import { ref, Ref, inject, onMounted } from "vue";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { getAllProducts, getAllDownlines } from "@/store/firebaseControl";

const router = useRouter();
const store = useStore();
const email = ref("admin001");
const password = ref("123456");
const isShowMask: Ref<boolean> = inject("isShowMask") as Ref<boolean>;
const db = getFirestore();
onMounted(() => {
  store.commit("setClear");
});
async function login() {
  console.log("login");

  isShowMask.value = true;

  localStorage.clear();
  let userInfo: any = {};
  if (email.value == "" || password.value == "") {
    alert("請輸入帳號、密碼");
    return;
  }
  const queryUser = query(
    collection(db, "members"),
    where("account", "==", email.value),
    where("password", "==", password.value)
  );

  //取得使用者資訊並存取
  const userRef = await getDocs(queryUser);
  if (!userRef.empty) {
    userRef.forEach((doc) => {
      userInfo = doc.data();
      store.commit("setUserInfo", {
        docId: doc.id,
        ancestors: userInfo.ancestors,
        nickname: userInfo.nickname,
        urlsuffix: userInfo.urlsuffix,
        commissionPercentage: userInfo.commissionPercentage,
        registerDatetime: userInfo.registerDatetime,
        depth: userInfo.depth,
        parent: userInfo.parent,
        role: userInfo.role,
      });
    });

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

    // console.log("vuex:", store.state);
    router.push("/home");
  } else {
    alert("帳號密碼錯誤");
  }
  isShowMask.value = false;
}
</script>

<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-gray-50">
    <body class="h-full">
    ```
  -->
  <div class="items-center justify-center w-full h-screen">
    <div
      class="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-md space-y-8">
        <div>
          <img
            class="w-auto h-12 mx-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">
            登入頁面
          </h2>

          <!-- <p class="mt-2 text-sm text-center text-gray-600">
          Or
          {{ " " }}
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
            start your 14-day free trial
          </a>
        </p> -->
        </div>
        <form class="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" value="true" />
          <div class="-space-y-px rounded-md shadow-sm">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="電子郵件"
                v-model="email"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                name="password"
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
