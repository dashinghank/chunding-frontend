<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { getDoughnut, destroyChart } from "../store/doughnut";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  where,
  query,
} from "firebase/firestore";
var db = getFirestore();
const allNotVerifiedMember: Ref<any> = ref({});
const name = ref("");
const line = ref("");
const phonenumber = ref("");
const selectedUrlsuffix = ref("");
onMounted(async () => {
  await getAllNotVerifiedMember();
});
function onKolChange(e: any) {
  name.value = allNotVerifiedMember.value[e.target.value].kolname;
  line.value = allNotVerifiedMember.value[e.target.value].lineid;
  phonenumber.value = allNotVerifiedMember.value[e.target.value].phonenumber;
  selectedUrlsuffix.value = e.target.value;
}
async function getAllNotVerifiedMember() {
  var allMemebersSnapshot: any = await getDocs(
    query(collection(db, "members"), where("isVerified", "==", false))
  );
  allMemebersSnapshot.forEach((member: any) => {
    allNotVerifiedMember.value[member.data().urlsuffix] = {
      id: member.id,
      ...member.data(),
    };
  });
}
async function verifly() {
  console.log("verifly");
  if (confirm("是否確定通過驗證?")) {
    try {
      await updateDoc(
        doc(
          db,
          `members/${allNotVerifiedMember.value[selectedUrlsuffix.value].id}`
        ),
        {
          isVerified: true,
        }
      );
    } catch (e: any) {
      alert("修改失敗:" + e.message);
      return;
    }
    await getAllNotVerifiedMember();
    alert("修改成功");
  }
}
</script>
<template>
  <div class="container p-5">
    <div class="w-72">
      <label for="location" class="block text-sm font-medium text-gray-700"
        >請選擇要認證的KOL</label
      >
      <select
        @change="onKolChange"
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <template v-if="Object.keys(allNotVerifiedMember).length == 0">
          <option selected disabled>目前沒有需要驗證的KOL</option>
        </template>
        <template v-if="Object.keys(allNotVerifiedMember).length > 0">
          <option selected disabled hidden>選擇KOL</option>
          <option
            v-for="(member, key, index) in allNotVerifiedMember"
            :value="key"
            :key="key"
          >
            {{ member.nickname }}
          </option>
        </template>
      </select>
    </div>
    <div class="w-72">
      <div class="py-3">
        <label for="vLineId" class="block text-sm font-medium text-gray-700"
          >Line Id</label
        >
        <div class="mt-1">
          <input
            type="text"
            name="vLineId"
            id="vLineId"
            v-model="line"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div class="py-3">
        <label for="vName" class="block text-sm font-medium text-gray-700"
          >姓名</label
        >
        <div class="mt-1">
          <input
            type="text"
            name="vName"
            id="vName"
            v-model="name"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div class="py-3">
        <label
          for="vPhoneNumber"
          class="block text-sm font-medium text-gray-700"
          >電話</label
        >
        <div class="mt-1">
          <input
            type="text"
            name="vPhoneNumber"
            id="vPhoneNumber"
            v-model="phonenumber"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
    <div class="mt-4">
      <button
        type="button"
        @click="verifly"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        驗證
      </button>
    </div>
  </div>
</template>
