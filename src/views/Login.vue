<script setup lang="ts">
import { LockClosedIcon } from "@heroicons/vue/solid";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import "firebase/firestore";
import "firebase/auth";
import { onMounted, ref } from "@vue/runtime-core";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import moment from "moment";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId({ length: 10 });
const router = useRouter();
const store = useStore();
const email = ref("admin001@gmail.com");
const password = ref("123456");
const rememberme = ref();
const db = getFirestore();

onMounted(() => {
  console.log("login");
  console.log(store.state);

  // let userInfo: IUserInfo = {
  //   email: "",
  //   password: "",
  // };
  // let userInfoStr = localStorage.getItem("userInfo") ?? "";
  // if (userInfoStr != "") {
  //   userInfo = JSON.parse(userInfoStr);
  //   email.value = userInfo.email;
  //   password.value = userInfo.password;
  //   console.log(userInfo);
  // }
});

function register() {
  let registerDatetime = moment().valueOf();

  addDoc(collection(db, "members"), {
    account: "admin001@gmail.com",
    password: "123456",
    nickname: "admin001",
    depth: 0,
    islocked: false,
    role: "admin",
    urlsuffix: uid(),
    registerDatetime: registerDatetime,
    lastLoginDatetime: moment().valueOf(),
  });
}

async function login() {
  console.log("login");
  store.commit("setClear");
  localStorage.clear();
  console.log(store.state);
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
      console.log("user data:", doc.id, doc.data());
      store.commit("setMyInfo", {
        uid: doc.data().urlsuffix,
        role: doc.data().role,
        myProducts: doc.data().products,
      });
    });
    console.log(store.state);
    router.push("/home");
  } else {
    alert("帳號密碼錯誤");
  }

  //取得所有產品資訊並存取
  // await getProducts();
  await getAllDownlines([store.state.uid]);
  console.log(store.state);
}

async function getProducts() {
  var productsRef = await getDocs(collection(getFirestore(), "products"));
  let products: any = {};
  productsRef.forEach((doc) => {
    products[doc.id] = doc.data();
  });

  // Object.entries(store.state.exceptionalProducts).forEach(([key, value]) => {
  //   products[key].exceptional = value;
  // });

  store.commit("setProducts", products);
}

//取得我下面所有的下線(所有的兒孫都算, 無論層數)
async function getAllDownlines(suffixes: string[]) {
  let children: string[] = [];
  for (let i = 0; i < suffixes.length; ++i) {
    let myQuery = query(
      collection(db, "members"),
      where("parent", "==", suffixes[i])
    );
    var usersRef = await getDocs(myQuery);
    usersRef.forEach((doc) => {
      let downline = doc.data();
      children.push(downline.urlsuffix);
      store.commit("setDownline", downline);
    });

    if (children.length > 0) {
      await getAllDownlines(children);
    }
  }
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
            登入，讓我們開始吧！
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

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                ref="rememberme"
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label for="remember-me" class="block ml-2 text-sm text-gray-900">
                記住我的登入資訊
              </label>
            </div>

            <div class="text-sm">
              <a
                href="#"
                class="font-medium text-indigo-600 hover:text-indigo-500"
              >
                忘記密碼?
              </a>
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
        <div @click="register">
          <button
            class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            註冊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
