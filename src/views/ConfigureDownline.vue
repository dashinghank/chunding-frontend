<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

let store = useStore();

// ===== data ref =====
let allDownlinesRef = ref();
let currentSelectSuffix = ref("");
// ===== input ref =====
let selectDownlineRef = ref();
let ancestorsRef = ref();
let nicknameRef = ref();
let commissionPercentageRef = ref();

onMounted(() => {
  allDownlinesRef.value = Object.values(store.state.downlines).filter(
    (d: any) => d.depth == store.state.userInfo.depth + 1
  );

  console.log(selectDownlineRef.value.value);
});

function queryDownline() {
  currentSelectSuffix.value = selectDownlineRef.value.value;
  let currentDownline = store.state.downlines[currentSelectSuffix.value];
  nicknameRef.value = currentDownline.nickname;
  ancestorsRef.value = currentDownline.ancestors;
  commissionPercentageRef.value = currentDownline.commissionPercentage * 100;
  // console.log(currentSelectSuffix);
}

async function configureDownline() {
  let currentDownline = store.state.downlines[currentSelectSuffix.value];

  let db = getFirestore();
  try {
    await updateDoc(doc(db, `members/${currentDownline.docId}`), {
      nickname: nicknameRef.value,
      commissionPercentage: commissionPercentageRef.value / 100,
    });
  } catch (e: any) {
    alert("修改失敗:" + e.message);
    return;
  }
  alert("修改成功");
}
</script>

<template>
  <div class="my-[10vh] container mx-auto">
    <div>選擇下線:</div>
    <div class="flex gap-5 mt-2">
      <select ref="selectDownlineRef">
        <option disabled selected hidden value="none">尚未選擇</option>
        <template v-for="(item, key, index) in allDownlinesRef" :key="index">
          <option :value="item.urlsuffix">{{ item.nickname }}</option>
        </template>
      </select>
      <div>
        <button
          type="button"
          @click="queryDownline"
          class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          查詢
        </button>
      </div>
    </div>
    <!-- //未選擇下線前不顯示 -->
    <div v-if="currentSelectSuffix != ''">
      <div class="mt-5">
        <div>
          <div class="max-w-[300px]">
            <label for="email" class="block text-sm font-medium text-gray-700"
              >綽號</label
            >
            <div class="mt-1">
              <input
                v-model="nicknameRef"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div class="mt-5">
          <div class="max-w-[300px]">
            <label for="email" class="block text-sm font-medium text-gray-700"
              >給予產品分潤%數 (可分配產品%數:{{
                store.state.userInfo.commissionPercentage * 100
              }}%)</label
            >
            <div class="flex gap-3 mt-1">
              <input
                v-model="commissionPercentageRef"
                type="range"
                min="0"
                :max="'{{ store.state.userInfo.commissionPercentage * 100 }}'"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <div>{{ commissionPercentageRef }}%</div>
            </div>
          </div>
        </div>
        <div class="mt-5">
          <div class="max-w-[300px]">
            <label for="email" class="block text-sm font-medium text-gray-700"
              >直屬上線</label
            >
            <div class="mt-1">
              <input
                disabled
                type="text"
                :value="store.state.userInfo.nickname"
                class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-5">
        <button
          @click="configureDownline"
          class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          修改
        </button>
      </div>
    </div>
  </div>
</template>
