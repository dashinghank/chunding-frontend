<script setup lang="ts">
// import { onMounted } from "vue";
import QRCode from "qrcode";

import { useStore } from "vuex";
import { inject, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { getFirestore } from "firebase/firestore";
import { CurrencyDollarIcon } from "@heroicons/vue/outline";
import axios from "axios";
const db = getFirestore();
const store = useStore();
const password = ref("");
const storeRef: any = ref();
storeRef.value = store.state;
const selectedProduct = ref(Object.keys(storeRef.value.allProducts)[0]);
const selectedProductQrcode = ref("");
const isShowMask = inject("isShowMask") as Ref<boolean>;

onMounted(async () => {
  selectedProductQrcode.value = await QRCode.toDataURL(
    "https://cz8888.tw/products/" +
      storeRef.value.allProducts[selectedProduct.value].displayName
        .split(" - ")[0]
        .trim() +
      "?k=" +
      storeRef.value.userInfo.urlsuffix
  );
});
watch(selectedProduct, async (newValue: any) => {
  selectedProductQrcode.value = await QRCode.toDataURL(
    "https://cz8888.tw/products/" +
      storeRef.value.allProducts[newValue].displayName.split(" - ")[0].trim() +
      "?k=" +
      storeRef.value.userInfo.urlsuffix
  );
  console.log(newValue);
  console.log(storeRef.value.allProducts[newValue].displayName);
  console.log(selectedProductQrcode.value);
});
function refresh() {
  console.log("refresh");
}

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
      isShowMask.value = true;
      let result = await axios.post(
        "https://shopify-api-nine.vercel.app/api/updateMember",
        {
          docId: `members/${storeRef.value.userInfo.docId}`,
          password: password.value.trim(),
        }
      );

      if (result.data.status == "000") {
        alert("密碼已更改");
      } else {
        alert("密碼更改失敗");
      }
    } catch (error) {
      console.log(error);
      alert("密碼更改失敗");
    }
  }
  isShowMask.value = false;
}
</script>
<template>
  <div class="container mx-auto px-5">
    <div class="flex py-5 w-full">
      <p
        class="font-semibold text-[32px] leading-[1.125] tracking-[.004em]"
        style="
          font-family: SF Pro TC, SF Pro Display, SF Pro Icons, AOS Icons,
            PingFang TC, Helvetica Neue, Helvetica, Arial, sans-serif;
        "
      >
        {{ storeRef.userInfo.nickname }}，你好:
      </p>
    </div>

    <div class="mt-7">
      <p
        style="
          font-family: SF Pro TC, SF Pro Display, SF Pro Icons, AOS Icons,
            PingFang TC, Helvetica Neue, Helvetica, Arial, sans-serif;
        "
        class="font-semibold text-xl leading-[1.125] tracking-[.004em]"
      >
        你的推廣網址
      </p>

      <div class="leading-[1.125] py-3 text-xl w-full max-w-[500px]">
        <div class="text-xl leading-[1.125] w-full mt-2">
          <p>官網</p>
          <div class="w-full" v-if="storeRef.userInfo.qrCodeUrl != ''">
            <img class="w-full" :src="storeRef.userInfo.qrCodeUrl" />
          </div>
          <p>
            <a :href="`https://cz8888.tw/?k=${storeRef.userInfo.urlsuffix}`">
              https://cz8888.tw/?k={{ storeRef.userInfo.urlsuffix }}
            </a>
          </p>
        </div>

        <div class="w-full mt-10">
          <label for="location" class="block font-medium text-gray-700"
            >商品</label
          >

          <select
            class="mt-1 block w-full pl-3 pr-10 py-2 text-xl border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl rounded-md"
            v-model="selectedProduct"
          >
            <template
              v-for="(value, key, index) in storeRef.allProducts"
              :key="value.vid"
            >
              <option :value="value.vid">
                {{ value.displayName.split(" - ")[0] }}
              </option>
            </template>
          </select>

          <div class="w-full" v-if="selectedProduct != ''">
            <img class="w-full" :src="selectedProductQrcode" />
          </div>
        </div>

        <div class="flex w-full overflow-auto" v-if="selectedProduct != ''">
          <a
            class="text-xl w-full"
            :href="`https://cz8888.tw/products/${storeRef.allProducts[
              selectedProduct
            ].displayName
              .split(' - ')[0]
              .trim()}?k=${storeRef.userInfo.urlsuffix}`"
            >https://cz8888.tw/products/{{
              storeRef.allProducts[selectedProduct].displayName
                .split(" - ")[0]
                .trim()
            }}?k={{ storeRef.userInfo.urlsuffix }}
          </a>
        </div>
      </div>
    </div>
    <div class="py-5">
      <p
        style="
          font-family: SF Pro TC, SF Pro Display, SF Pro Icons, AOS Icons,
            PingFang TC, Helvetica Neue, Helvetica, Arial, sans-serif;
        "
        class="font-semibold text-[32px] leading-[1.125] tracking-[.004em]"
      >
        帳號管理
      </p>
      <div class="py-3">
        <div class="flex justify-between">
          <p class="text-xl">紅利點數</p>

          <div>
            <button
              @click="refresh"
              type="button"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              刷新
            </button>
          </div>
        </div>
        <div class="overflow-hidden bg-white rounded-lg shadow">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component
                  :is="CurrencyDollarIcon"
                  class="w-6 h-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div class="flex-1 w-0 ml-5">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    總分紅點數
                  </dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">
                      {{ storeRef.commissionInfo.totalCommission }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="px-5 py-3 bg-gray-50"></div>
        </div>
        <br />
        <div class="overflow-hidden bg-white rounded-lg shadow">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component
                  :is="CurrencyDollarIcon"
                  class="w-6 h-6 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <div class="flex-1 w-0 ml-5">
                <div class="grid grid-cols-2">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      可領取點數
                    </dt>
                    <dd>
                      <div class="text-lg font-medium text-gray-900">
                        {{
                          storeRef.commissionInfo.totalCommission -
                          storeRef.commissionInfo.receivedCommission
                        }}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div class="px-5 py-3 bg-gray-50"></div>
        </div>
      </div>
      <div class="py-3">
        <p class="text-xl">更改密碼</p>
        <div class="flex w-full mt-1 rounded-md shadow-sm">
          <div class="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="text"
              v-model="password"
              class="block w-full pl-2 border border-gray-300 rounded-none focus:ring-indigo-500 focus:border-indigo-500 rounded-l-md sm:text-sm"
              placeholder="請輸入新密碼"
            />
          </div>
          <button
            @click="updatePassword"
            type="button"
            class="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <span>更改</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  @apply underline text-blue-600 hover:text-blue-800 visited:text-purple-600;
}
</style>
