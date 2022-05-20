<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  getFirestore,
  addDoc,
  deleteDoc,
  collection,
  getDocs,
  doc,
} from "firebase/firestore";
const allCarousels: any = ref({});
const carouselContent = ref("");
var db = getFirestore();

onMounted(async () => {
  await getAllCarousels();
});

// 取得所有跑馬燈
async function getAllCarousels() {
  allCarousels.value = {};
  var allCarouselsSnapshot = await getDocs(collection(db, "carousels"));
  allCarouselsSnapshot.forEach((d) => {
    console.log("data():", d.data());
    allCarousels.value[d.id] = d.data();
  });
}

//新增跑馬燈
async function addCarousel() {
  if (carouselContent.value == "") {
    alert("請輸入跑馬燈內容");
  } else {
    console.log(carouselContent.value);
    try {
      await addDoc(collection(db, "carousels"), {
        startDatetime: 0,
        endDatetime: 1,
        msg: carouselContent.value,
      });

      await getAllCarousels();
    } catch (error) {
      alert("新增跑馬燈失敗");
      console.log("error:", error);
    }
  }
}

//刪除跑馬燈
async function deleteCarousel(docId: string) {
  console.log("deleteCarousel");
  console.log(docId);
  if (confirm("是否要刪除這筆跑馬燈?")) {
    try {
      await deleteDoc(doc(db, "carousels", docId));
      alert("刪除跑馬燈成功");
      await getAllCarousels();
    } catch (error) {
      alert("刪除跑馬燈失敗");
      console.log(error);
    }
  }
}
</script>
<template>
  <div class="p-5">
    <div>跑馬燈修正頁面</div>

    <div>
      <div class="mt-12 text-3xl font-bold py-3">跑馬燈設定</div>
      <div class="flex gap-5 py-5">
        <div class="w-7/12">
          <div class="mt-1">
            <textarea
              rows="5"
              v-model="carouselContent"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div class="self-end">
          <button
            type="button"
            @click="addCarousel"
            class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            新增一條跑馬燈
          </button>
        </div>
      </div>
      <div
        v-for="(carousels, docId) in allCarousels"
        :key="docId"
        class="flex gap-5 py-5"
      >
        <div class="w-7/12">
          <div class="mt-1">
            <textarea
              rows="5"
              :value="carousels.msg"
              class="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div class="self-end">
          <button
            type="button"
            @click="deleteCarousel(docId.toString())"
            class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            刪除這條跑馬燈
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
