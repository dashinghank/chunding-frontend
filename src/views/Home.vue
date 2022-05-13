<script setup lang="ts">
// import { onMounted } from "vue";
import { useStore } from "vuex";
import { inject, onMounted, ref, Ref } from "vue";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
const db = getFirestore();
const store = useStore();
const password = ref("");
onMounted(async () => {});

async function updatePassword() {
  console.log("updatePassword");

  if (password.value.trim() == "") {
    alert("請填寫密碼");
    return;
  }

  let isUpdate = confirm(
    `這是你要使用的新密碼: \n${password.value.trim()}\n \n確定更改嗎?`
  );
  console.log(store.state);
  if (isUpdate) {
    try {
      await updateDoc(doc(db, `members/${store.state.userInfo.docId}`), {
        password: password.value.trim(),
      });
      alert("密碼已更改");
    } catch (error) {
      console.log(error);
      alert("密碼更改失敗");
    }
  }
}
</script>
<template>
  <div class="container flex mx-auto mt-20">
    <div>
      <div class="font-bold text-xl">這是你的推廣網址:</div>
      <div class="bg-gray-200">
        https://chyuinding.myshopify.com/?k={{ store.state.userInfo.urlsuffix }}
      </div>
      <div class="mt-12">
        <label class="font-bold text-xl">暱稱:</label>
        <div>{{ store.state.userInfo.nickname }}</div>
      </div>
      <div class="mt-12" v-if="store.state.userInfo.qrCodeUrl != ''">
        <div class="font-bold text-xl">QR CODE 網站連結</div>
        <img :src="(store.state.userInfo.qrCodeUrl as any)" />
      </div>

      <div class="font-bold text-xl mt-12">更改密碼</div>
      <div class="mt-2">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >新密碼</label
          >
          <div class="mt-1 flex rounded-md shadow-sm">
            <div
              class="relative flex items-stretch flex-grow focus-within:z-10"
            >
              <input
                type=""
                name="email"
                id="email"
                v-model="password"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none border border-gray-300 rounded-l-md pl-2 sm:text-sm border-gray-300"
                placeholder="請輸入新密碼"
              />
            </div>
            <button
              @click="updatePassword"
              type="button"
              class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <span>確定更改</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
