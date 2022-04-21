<script setup lang="ts">
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import moment from "moment";
import ShortUniqueId from "short-unique-id";
import { ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
var db = getFirestore();
const uid = new ShortUniqueId({ length: 10 });
const account = ref("");
const password = ref("");
const nickname = ref("");
async function createDownline() {
  console.log("createDownline");
  if (account.value == "" || password.value == "" || nickname.value == "") {
    alert("請輸入帳號、密碼、暱稱");
    return;
  }

  const queryUser = query(
    collection(db, "members"),
    where("account", "==", account.value)
  );

  //帳號重複
  const userRef = await getDocs(queryUser);
  console.log(userRef.empty);
  if (!userRef.empty) {
    alert("此帳號已被註冊");
    return;
  }
  //帳號重複

  let registerDatetime = moment().valueOf();
  let parentData = {
    urlsuffix: "",
    depth: 0,
  };

  const queryParent = query(
    collection(db, "members"),
    where("urlsuffix", "==", store.state.uid)
  );
  const parentRef = await getDocs(queryParent);

  parentRef.forEach((doc) => {
    console.log("user data:", doc.id, doc.data());
    parentData["depth"] = doc.data().depth;
    parentData["urlsuffix"] = doc.data().urlsuffix;
  });

  console.log(parentData);
  await addDoc(collection(db, "members"), {
    account: account.value,
    password: password.value,
    nickname: nickname.value,
    depth: parentData["depth"] + 1,
    islocked: false,
    parent: parentData["urlsuffix"],
    registerDatetime: registerDatetime,
    lastLoginDatetime: moment().valueOf(),
    urlsuffix: uid(),
    role: "kol",
    exceptionalProducts: {},

    // islocked
    // addOrderDatetime: moment().valueOf(),
  });
}
</script>

<template>
  <div class="h-screen w-full flex justify-center items-center">
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
          <div class="shadow overflow-hidden sm:rounded-md">
            <div class="px-4 py-5 bg-white sm:p-6">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-6 sm:col-span-0">
                  <label
                    for="account"
                    class="block text-sm font-medium text-gray-700"
                    >帳號</label
                  >
                  <input
                    v-model="account"
                    type="text"
                    name="account"
                    id="account"
                    autocomplete="account"
                    class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div class="col-span-6 sm:col-span-0">
                  <label
                    for="password"
                    class="block text-sm font-medium text-gray-700"
                    >密碼</label
                  >
                  <input
                    v-model="password"
                    type="text"
                    name="password"
                    id="password"
                    autocomplete="password"
                    class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div class="col-span-6 sm:col-span-0">
                  <label
                    for="nickname"
                    class="block text-sm font-medium text-gray-700"
                    >暱稱</label
                  >
                  <input
                    type="text"
                    name="nickname"
                    id="nickname"
                    v-model="nickname"
                    autocomplete="name"
                    class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                @click="createDownline"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
