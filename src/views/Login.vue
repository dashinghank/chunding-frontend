<script setup lang="ts">
import { LockClosedIcon } from "@heroicons/vue/solid";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { onMounted, ref } from "@vue/runtime-core";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import moment from "moment";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId({ length: 10 });
interface IUserInfo {
  email: string;
  password: string;
}
const router = useRouter();
const store = useStore();
const auth = getAuth();
const email = ref("admin001@gmail.com");
const password = ref("123456");
const rememberme = ref();
const db = getFirestore();
store.commit("setUid", {
  uid: "",
  role: "",
});
onMounted(() => {
  localStorage.clear();

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
  if (email.value == "" || password.value == "") {
    alert("請輸入帳號、密碼");
    return;
  }
  const queryUser = query(
    collection(db, "members"),
    where("account", "==", email.value)
  );

  const materialRef = await getDocs(queryUser);
  console.log(materialRef.empty);
  if (!materialRef.empty) {
    materialRef.forEach((doc) => {
      console.log("user data:", doc.id, doc.data());
      store.commit("setUid", {
        uid: doc.data().urlsuffix,
        role: doc.data().role,
      });
    });
    console.log(store.state.uid);

    router.push("/home");
  } else {
    alert("帳號密碼錯誤");
  }

  // let userInfo = {
  //   email: email.value,
  //   password: password.value,
  // };

  // if (rememberme.value.checked) {
  //   localStorage.setItem("userInfo", JSON.stringify(userInfo));
  // }
}
function logintest() {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential: any) => {
      const user = userCredential.user;
      console.log("userInfo", user.uid);

      let userInfo = {
        email: email.value,
        password: password.value,
      };
      store.commit("setUid", {
        uid: user.uid,
      });

      if (rememberme.value.checked) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      router.push("/home");
    })
    .catch((error) => {
      console.log(error);
      // const errorCode = error.code;
      // const errorMessage = error.message;
    });
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
  <div class="h-screen w-full justify-center items-center">
    <div
      class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8">
        <div>
          <img
            class="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登入，讓我們開始吧！
          </h2>

          <!-- <p class="mt-2 text-center text-sm text-gray-600">
          Or
          {{ " " }}
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
            start your 14-day free trial
          </a>
        </p> -->
        </div>
        <form class="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" value="true" />
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required=""
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                required=""
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <LockClosedIcon
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                aria-hidden="true"
              />
            </span>
            登入
          </button>
        </div>
        <div @click="register">
          <button
            class="relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            註冊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
