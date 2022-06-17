<script setup lang="ts">
import { inject, onMounted, ref, Ref } from "vue";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  where,
  query,
} from "firebase/firestore";
import axios from "axios";
var db = getFirestore();

const allNotVerifiedMember: Ref<any> = ref({});

const isShowMask = inject("isShowMask") as Ref<boolean>;

//----input ref----
const name = ref("");
const line = ref("");
const insta = ref("");
const phonenumber = ref("");
const selectedUrlsuffix = ref("");
const visAgentProduct = ref(false);
const visInGroup = ref(false);

onMounted(async () => {
  await getAllNotVerifiedMember();
});
function onKolChange(e: any) {
  name.value = allNotVerifiedMember.value[e.target.value].kolname;
  line.value = allNotVerifiedMember.value[e.target.value].lineid;
  insta.value = allNotVerifiedMember.value[e.target.value].instaId;
  visAgentProduct.value =
    allNotVerifiedMember.value[e.target.value].isAgentProduct;
  visInGroup.value = allNotVerifiedMember.value[e.target.value].isInGroup;
  phonenumber.value = allNotVerifiedMember.value[e.target.value].phonenumber;
  selectedUrlsuffix.value = e.target.value;
}
async function getAllNotVerifiedMember() {
  //verifiedStatus 2 為驗證中
  var allNotVerifiedMembersSnapshot: any = await getDocs(
    query(collection(db, "members"), where("verifiedStatus", "==", 2))
  );
  allNotVerifiedMembersSnapshot.forEach((member: any) => {
    allNotVerifiedMember.value[member.data().urlsuffix] = {
      id: member.id,
      ...member.data(),
    };
  });
}
async function verifly() {
  if (confirm("是否確定通過驗證?")) {
    isShowMask.value = true;
    try {
      let selectedMember = allNotVerifiedMember.value[selectedUrlsuffix.value];

      let result = await axios.post(
        "https://shopify-api-nine.vercel.app/api/updateMember",
        {
          docId: `${selectedMember.id}`,
          // 1 代表通過驗證
          verifiedStatus: 1,
        }
      );

      if (result.data.status == "000") {
        alert("驗證成功");
      } else {
        alert("驗證失敗");
        isShowMask.value = false;

        return;
      }

      // await updateDoc(doc(db, `members/${selectedMember.id}`), {
      //   // 1 代表通過驗證
      //   verifiedStatus: 1,
      // });
    } catch (e: any) {
      alert("修改失敗:" + e.message);
      isShowMask.value = false;

      return;
    }
    await getAllNotVerifiedMember();
    isShowMask.value = false;
  }
}

async function rejectApplication() {
  if (confirm("是否確定拒絕驗證?")) {
    isShowMask.value = true;

    let selectedMember = allNotVerifiedMember.value[selectedUrlsuffix.value];

    try {
      let result = await axios.post(
        "https://shopify-api-nine.vercel.app/api/updateMember",
        {
          docId: `${selectedMember.id}`,
          // 1 代表通過驗證
          vverifiedStatus: -1,
        }
      );

      if (result.data.status == "000") {
        alert("拒絕成功");
      } else {
        alert("拒絕失敗");
        isShowMask.value = false;

        return;
      }

      // await updateDoc(doc(db, `members/${selectedMember.id}`), {
      //   //-1代表拒絕審核通過
      //   verifiedStatus: -1,
      // });
    } catch (e: any) {
      alert("資料傳送失敗:" + e.message);
      isShowMask.value = false;

      return;
    }
    await getAllNotVerifiedMember();
    isShowMask.value = false;
    alert("已拒絕審核通過");
  }
}
</script>
<template>
  <div class="container mx-auto px-5">
    <div class="w-full max-w-72">
      <label for="location" class="block text-sm font-medium text-gray-700"
        >請選擇要認證的KOL</label
      >
      <select
        @change="onKolChange"
        class="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <template v-if="Object.keys(allNotVerifiedMember).length == 0">
          <option selected disabled>目前沒有需要驗證的KOL</option>
        </template>
        <template v-if="Object.keys(allNotVerifiedMember).length > 0">
          <option selected disabled hidden>選擇KOL</option>
          <option
            v-for="(member, key, index) in allNotVerifiedMember"
            :value="key"
            :key="index"
          >
            {{ member.nickname }}
          </option>
        </template>
      </select>
    </div>
    <div class="w-full max-w-72">
      <div class="py-3">
        <label for="vInstaId" class="block text-sm font-medium text-gray-700"
          >Instagram ID</label
        >
        <div class="mt-1">
          <input
            type="text"
            name="vInstaId"
            id="vInstaId"
            v-model="insta"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
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
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div class="py-3">
        <fieldset class="space-y-5">
          <div class="relative flex items-start">
            <div class="flex items-center h-5">
              <input
                disabled
                id="visInGroup"
                aria-describedby="comments-description"
                name="visInGroup"
                type="checkbox"
                :checked="visInGroup"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="visInGroup" class="font-medium text-gray-700"
                >是否進入代理群
              </label>
            </div>
          </div>
          <div class="relative flex items-start">
            <div class="flex items-center h-5">
              <input
                disabled
                id="visAgentProduct"
                aria-describedby="candidates-description"
                name="visAgentProduct"
                type="checkbox"
                :checked="visAgentProduct"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="isAgentProduct" class="font-medium text-gray-700"
                >目前有無經營公司產品</label
              >
            </div>
          </div>
        </fieldset>
      </div>
    </div>
    <div class="flex gap-5 mt-4">
      <template v-if="selectedUrlsuffix != ''">
        <button
          type="button"
          @click="verifly"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          驗證
        </button>
        <button
          type="button"
          @click="rejectApplication"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          審核不予通過
        </button>
      </template>
    </div>
  </div>
</template>
