<script setup lang="ts">
import { Ref, ref } from "vue";
import { Chart, registerables } from "chart.js";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import axios from "axios";
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

import { inject } from "vue";
Chart.register(...registerables);
const db = getFirestore();

//---- data ref ----
const currentMember = inject("currentMember") as any;
const isVeriflyInfoFormOpen = inject("isVeriflyInfoFormOpen") as Ref<boolean>;

//---- input ref ----
const phonenumber = ref();
const lineid = ref();
const kolname = ref();
const instaId = ref();
const isInGroup = ref();
const isAgentProduct = ref();

async function setKolVeriflyData() {
  if (
    lineid.value.value == "" ||
    phonenumber.value.value == "" ||
    kolname.value.value == ""
  ) {
    alert("請填寫完整資料");
    return;
  }
  try {
    let result = await axios.post(
      "https://shopify-api-nine.vercel.app/api/updateMember",
      {
        // 2為驗證中
        docId: `${currentMember.value.docId}`,
        verifiedStatus: 2,
        instaId: instaId.value.value,
        lineid: lineid.value.value,
        phonenumber: phonenumber.value.value,
        kolname: kolname.value.value,
        isAgentProduct: isAgentProduct.value.checked,
        isInGroup: isInGroup.value.checked,
      }
    );

    // await updateDoc(doc(db, `members/${currentMember.value.docId}`), {
    //   // 2為驗證中
    //   verifiedStatus: 2,
    //   instaId: instaId.value.value,
    //   lineid: lineid.value.value,
    //   phonenumber: phonenumber.value.value,
    //   kolname: kolname.value.value,
    //   isAgentProduct: isAgentProduct.value.checked,
    //   isInGroup: isInGroup.value.checked,
    // });
    if (result.data.status == "000") {
      alert("送出資料成功");
    } else {
      alert("送出資料失敗");
    }
  } catch (error) {
    alert("送出資料失敗");
    console.log("error:", error);
  }
  isVeriflyInfoFormOpen.value = false;
}
</script>
<template>
  <TransitionRoot as="template" :show="isVeriflyInfoFormOpen">
    <Dialog
      as="div"
      class="relative z-10"
      @close="isVeriflyInfoFormOpen = false"
    >
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
          <!-- This element is to trick the browser into centering the modal contents. -->
          <span
            class="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
            >&#8203;</span
          >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
            >
              <div>
                <div>填寫資料以取得代理授權</div>
                <div class="py-3">
                  <label
                    for="instaid"
                    class="block text-sm font-medium text-gray-700"
                    >Instagram ID</label
                  >
                  <div class="mt-1">
                    <input
                      ref="instaId"
                      type="text"
                      name="instaid"
                      id="instaid"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="輸入Instagram ID"
                    />
                  </div>
                </div>
                <div class="py-3">
                  <label
                    for="lineid"
                    class="block text-sm font-medium text-gray-700"
                    >Line Id</label
                  >
                  <div class="mt-1">
                    <input
                      ref="lineid"
                      type="text"
                      name="lineid"
                      id="lineid"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="輸入Line Id"
                    />
                  </div>
                </div>
                <div class="py-3">
                  <label
                    for="phonenumber"
                    class="block text-sm font-medium text-gray-700"
                    >電話</label
                  >
                  <div class="mt-1">
                    <input
                      ref="phonenumber"
                      type="number"
                      name="phonenumber"
                      id="phonenumber"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="輸入電話"
                    />
                  </div>
                </div>
                <div class="py-3">
                  <label
                    for="kolname"
                    class="block text-sm font-medium text-gray-700"
                    >姓名</label
                  >
                  <div class="mt-1">
                    <input
                      ref="kolname"
                      type="text"
                      name="kolname"
                      id="kolname"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="輸入姓名"
                    />
                  </div>
                </div>
                <div class="py-3">
                  <fieldset class="space-y-5">
                    <div class="relative flex items-start">
                      <div class="flex items-center h-5">
                        <input
                          ref="isInGroup"
                          id="isInGroup"
                          aria-describedby="comments-description"
                          name="isInGroup"
                          type="checkbox"
                          class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="isInGroup" class="font-medium text-gray-700"
                          >是否進入代理群
                        </label>
                      </div>
                    </div>
                    <div class="relative flex items-start">
                      <div class="flex items-center h-5">
                        <input
                          ref="isAgentProduct"
                          id="isAgentProduct"
                          aria-describedby="candidates-description"
                          name="isAgentProduct"
                          type="checkbox"
                          class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label
                          for="isAgentProduct"
                          class="font-medium text-gray-700"
                          >目前有無經營公司產品</label
                        >
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button
                  type="button"
                  class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  @click="setKolVeriflyData"
                >
                  確定送出
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
