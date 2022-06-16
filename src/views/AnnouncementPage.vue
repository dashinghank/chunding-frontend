<script setup lang="ts">
import { useStore } from "vuex";
import { inject, onMounted, ref, Ref } from "vue";
import moment from "moment";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  getFirestore,
  deleteDoc,
} from "firebase/firestore";
import { getAllAnnouncements } from "@/store/firebaseControl";

const announcementContent = ref("");
const announcementTitle = ref("");
const allAnnouncements = ref([]) as Ref<any[]>;

const store = useStore();
const isShowMask = inject("isShowMask") as Ref<boolean>;
var db = getFirestore();

// 取得所有跑馬燈
onMounted(async () => {
  isShowMask.value = true;
  allAnnouncements.value = await getAllAnnouncements();
  isShowMask.value = false;
  console.log(allAnnouncements.value);
});

//新增公告
async function addAnnouncement() {
  console.log("addAnnouncement");

  if (
    announcementContent.value.trim() == "" ||
    announcementTitle.value.trim() == ""
  ) {
    alert("請輸入公告內容及標題");
  } else {
    console.log(announcementContent.value);
    try {
      isShowMask.value = true;
      let now = moment().valueOf();
      let newAnnouncement: any = {
        datetime: now,
        isOpen: true,
        title: announcementTitle.value,
        content: announcementContent.value,
      };
      await addDoc(collection(db, "announcements"), newAnnouncement);
      await updateDoc(doc(db, "systems/announcements"), {
        lastUpdatedDatetime: now,
      });
      alert("新增成功");

      allAnnouncements.value = await getAllAnnouncements();

      announcementContent.value = "";
      announcementTitle.value = "";
    } catch (error) {
      alert("新增公告失敗");
      console.log("error:", error);
    }
    isShowMask.value = false;
  }
}

//刪除公告
async function deleteAnnouncement(docId: string) {
  console.log("deleteAnnouncement");
  console.log(docId);
  if (confirm("是否要刪除這筆公告?")) {
    try {
      isShowMask.value = true;
      await deleteDoc(doc(db, "announcements", docId));
      alert("刪除公告成功");
      allAnnouncements.value = allAnnouncements.value.filter(
        (announcement) => announcement.id != docId
      );
      allAnnouncements.value = await getAllAnnouncements();
    } catch (error) {
      alert("刪除公告失敗");
      console.log(error);
    }
    isShowMask.value = false;
  }
}
</script>
<template>
  <div class="container mx-auto leading-6">
    <div
      v-if="
        store.state.userInfo.role == 'admin' ||
        store.state.userInfo.role == 'sub'
      "
    >
      <div
        class="rounded-md border-2 p-5 shadow-lg bg-gray-100 w-full lg:w-10/12 mx-auto"
      >
        <div class="flex justify-between items-end">
          <div class="text-3xl font-bold">管理者新增公告</div>
        </div>
        <hr class="my-2" />
        <div class="flex gap-3 w-full">
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700"
              >公告標題</label
            >
            <div class="mt-1">
              <input
                v-model="announcementTitle"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <br />

        <div class="w-full flex gap-3">
          <div class="flex gap-3 w-full">
            <div class="w-full">
              <label class="block text-sm font-medium text-gray-700"
                >公告內文</label
              >
              <div class="mt-1">
                <textarea
                  rows="7"
                  v-model="announcementContent"
                  class="w-full block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-5">
          <button
            @click="addAnnouncement"
            type="button"
            class="self-center px-5 py-3 text-lg font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm first-letter:inline-flex md:self-end md:text-sm h-fit hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            新增
          </button>
        </div>
      </div>
      <br />
      <br />
    </div>
    <div
      v-for="allAnnouncement in allAnnouncements"
      :key="allAnnouncement.docId"
      class="lg:w-10/12 mx-auto"
    >
      <div class="rounded-md border-2 p-5 shadow-lg">
        <div class="flex justify-between items-end">
          <div class="text-3xl font-bold">{{ allAnnouncement.title }}</div>
        </div>
        <div class="flex justify-end">
          <div class="text-gray-400 text-right text-xs">
            {{ moment(allAnnouncement.datetime).format("YYYY/MM/DD HH:mm") }}
          </div>
        </div>
        <hr class="my-2" />
        <div class="w-full">
          <p class="break-words">
            {{ allAnnouncement.content }}
          </p>
        </div>
        <div
          class="flex justify-end"
          v-if="
            store.state.userInfo.role == 'admin' ||
            store.state.userInfo.role == 'sub'
          "
        >
          <div>
            <button
              type="button"
              @click="deleteAnnouncement(allAnnouncement.docId.toString())"
              class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
      <br />
      <br />
    </div>
  </div>
</template>
