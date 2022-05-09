<script setup lang="ts">
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import ShortUniqueId from "short-unique-id";
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
import moment from "moment";
const store = useStore();
var db = getFirestore();
const uid = new ShortUniqueId({ length: 10 });

//==== input ref ====
const account = ref("");
const password = ref("");
const nickname = ref("");
const commissionPercentage = ref(0);

onMounted(() => {
  console.log(store.state);
});

async function createDownline() {
  if (await checkDuplicateAccount()) {
    alert("帳號重複");
    return;
  }

  if (hasEmptyInput()) {
    alert("請輸入完整資料");
    return;
  }

  let currentDatetime = moment().valueOf();
  let newDownline = {
    account: account.value,
    password: password.value,
    nickname: nickname.value,
    commissionPercentage: parseFloat(
      (commissionPercentage.value / 100).toFixed(2)
    ),
    depth: store.state.userInfo.depth + 1,
    islocked: false,
    lastloginDatetime: currentDatetime,
    registerDatetime: currentDatetime,
    role: "kol",
    urlsuffix: uid(),
    ancestors:
      store.state.userInfo.ancestors.length == 0
        ? [store.state.userInfo.urlsuffix]
        : [...store.state.userInfo.ancestors, store.state.userInfo.urlsuffix],
    parent: store.state.userInfo.urlsuffix,
  };

  try {
    await addDoc(collection(db, "members"), newDownline);
  } catch (e) {
    alert("新增失敗");
    return;
  }
  store.state.downlines[newDownline.urlsuffix] = newDownline;
}

async function checkDuplicateAccount() {
  let tempQuery = query(
    collection(db, "members"),
    where("account", "==", account.value)
  );
  let tempDocs = await getDocs(tempQuery);
  return tempDocs.docs.length > 0;
}

function hasEmptyInput() {
  if (account.value == "") return true;
  if (password.value == "") return true;
  if (nickname.value == "") return true;
  return false;
}
</script>

<template>
  <div class="flex container mx-auto mt-[10vh]">
    <div class="mt-10 sm:mt-0">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              建立你的下線
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              請輸入下線的帳號、密碼及暱稱
            </p>
          </div>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <div class="overflow-hidden shadow sm:rounded-md">
            <div class="px-4 py-5 bg-white sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-6 sm:col-span-0">
                  <label class="block text-sm font-medium text-gray-700"
                    >帳號</label
                  >
                  <input
                    v-model="account"
                    type="text"
                    class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div class="col-span-6 sm:col-span-0">
                  <label class="block text-sm font-medium text-gray-700"
                    >密碼</label
                  >
                  <input
                    v-model="password"
                    type="text"
                    class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div class="col-span-6 sm:col-span-0">
                  <label class="block text-sm font-medium text-gray-700"
                    >暱稱</label
                  >
                  <input
                    type="text"
                    v-model="nickname"
                    class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div class="col-span-6 sm:col-span-0">
                  <div class="flex">
                    <label
                      for="nickname"
                      class="block text-sm font-medium text-gray-700"
                      >產品分潤</label
                    >
                    <label
                      for="nickname"
                      class="block text-sm font-medium text-red-500"
                    >
                      - 可分配產品%數:
                      {{
                        store.state.userInfo.commissionPercentage * 100
                      }}%</label
                    >
                  </div>
                  <div class="flex gap-5">
                    <input
                      type="range"
                      :max="store.state.userInfo.commissionPercentage * 100"
                      v-model="commissionPercentage"
                      class="block w-3/4 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div>{{ commissionPercentage }} %</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-3 text-right bg-gray-50 sm:px-6">
              <button
                @click="createDownline"
                class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
