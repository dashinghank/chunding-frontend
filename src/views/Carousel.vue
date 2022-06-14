<script setup lang="ts">
import { onMounted, ref, Ref, inject } from "vue";
import {
  getFirestore,
  addDoc,
  deleteDoc,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useStore } from "vuex";
import { getAllCarousels } from "@/store/firebaseControl";
import moment from "moment";

const store = useStore();
const isShowMask = inject("isShowMask") as Ref<boolean>;

const carouselContent = ref("");
const allCarousels = ref([]) as Ref<any[]>;

var db = getFirestore();

// 取得所有跑馬燈
onMounted(async () => {
  isShowMask.value = true;
  allCarousels.value = await getAllCarousels();
  isShowMask.value = false;
});
//新增跑馬燈
async function addCarousel() {
  if (carouselContent.value.trim() == "") {
    alert("請輸入跑馬燈內容");
  } else {
    console.log(carouselContent.value);
    try {
      isShowMask.value = true;
      let newCarousel: any = {
        startDatetime: 0,
        endDatetime: 1,
        msg: carouselContent.value,
      };
      await addDoc(collection(db, "carousels"), newCarousel);
      await updateDoc(doc(db, "systems/carousels"), {
        lastUpdatedDatetime: moment().valueOf(),
      });
      alert("新增成功");
      // allCarousels.value.push(newCarousel);
      allCarousels.value = await getAllCarousels();
    } catch (error) {
      alert("新增跑馬燈失敗");
      console.log("error:", error);
    }
    isShowMask.value = false;
    store.commit("setAllCarousels", allCarousels);
  }
}

//刪除跑馬燈
async function deleteCarousel(docId: string) {
  console.log("deleteCarousel");
  if (confirm("是否要刪除這筆跑馬燈?")) {
    try {
      isShowMask.value = true;
      await deleteDoc(doc(db, "carousels", docId));
      alert("刪除跑馬燈成功");
      // allCarousels.value = allCarousels.value.filter(
      //   (carousel) => carousel.id != docId
      // );
      allCarousels.value = await getAllCarousels();
    } catch (error) {
      alert("刪除跑馬燈失敗");
      console.log(error);
    }
    isShowMask.value = false;
    store.commit("setAllCarousels", allCarousels);
  }
}
</script>
<template>
  <div class="container mx-auto">
    <div class="text-3xl font-bold">跑馬燈設定</div>
    <div class="flex gap-5 py-5">
      <div class="w-10/12">
        <div class="mt-1">
          <textarea
            rows="1"
            v-model="carouselContent"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div class="self-end">
        <button
          type="button"
          @click="addCarousel"
          class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          新增
        </button>
      </div>
    </div>
    <div
      v-for="carousels in store.state.allCarousels"
      :key="carousels.docId"
      class="flex gap-5 py-5"
    >
      <div class="w-10/12">
        <div class="mt-1">
          <textarea
            rows="1"
            :value="carousels.msg"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
      </div>
      <div class="self-end">
        <button
          type="button"
          @click="deleteCarousel(carousels.docId.toString())"
          class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          刪除
        </button>
      </div>
    </div>
  </div>
</template>
