<script setup lang="ts">
// import { onMounted } from "vue";
import { useStore } from "vuex";
import { inject, onMounted, onUnmounted, ref, Ref } from "vue";
import { getFirestore } from "firebase/firestore";
import { CurrencyDollarIcon } from "@heroicons/vue/outline";
import axios from "axios";
const db = getFirestore();
const store = useStore();
const password = ref("");
const storeRef: any = ref();
storeRef.value = store.state;
console.log(store.state);
console.log(storeRef.value);
const selectedProduct = ref(Object.keys(storeRef.value.allProducts)[0]);

onMounted(async () => {});
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
      let result = await axios.post(
        "https://shopify-api-nine.vercel.app/api/updateMember",
        {
          docId: `members/${storeRef.value.userInfo.docId}`,
          password: password.value.trim(),
        }
      );

      console.log(result);

      // await updateDoc(doc(db, `members/${store.state.userInfo.docId}`), {
      //   password: password.value.trim(),
      // });
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
}
</script>
<template>
  <div class="container grid grid-cols-[60%,40%] mx-auto mt-20">
    <div>
      <div class="text-xl font-bold">這是你的推廣網址:</div>
      <div>
        <a :href="`https://cz8888.tw/?k=${storeRef.userInfo.urlsuffix}`">
          https://cz8888.tw/?k={{ storeRef.userInfo.urlsuffix }}
        </a>
      </div>
      <div class="mt-5 text-xl font-bold">
        範例產品推廣網址:
        <select class="w-1/4" v-model="selectedProduct">
          <template
            v-for="(value, key, index) in storeRef.allProducts"
            :key="value.vid"
          >
            <option :value="value.vid">
              {{ value.displayName.split(" - ")[0] }}
              <!-- {{ index }} -->
            </option>
          </template>
        </select>
      </div>
      <div class="mt-4">
        <div v-if!="selectedProduct">
          <a
            :href="`https://cz8888.tw/products/${storeRef.allProducts[
              selectedProduct
            ].displayName
              .split(' - ')[0]
              .trim()}?k=${storeRef.userInfo.urlsuffix}`"
          >
            https://cz8888.tw/products/{{
              storeRef.allProducts[selectedProduct].displayName
                .split(" - ")[0]
                .trim()
            }}?k={{ storeRef.userInfo.urlsuffix }}
          </a>
        </div>
      </div>
      <div class="mt-12">
        <label class="text-xl font-bold">暱稱:</label>
        <div>{{ storeRef.userInfo.nickname }}</div>
      </div>
      <div class="mt-12" v-if="storeRef.userInfo.qrCodeUrl != ''">
        <div class="text-xl font-bold">QR CODE 網站連結</div>
        <img :src="storeRef.userInfo.qrCodeUrl" />
      </div>

      <div class="mt-12 text-xl font-bold">更改密碼</div>
      <div class="mt-2">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >新密碼</label
          >
          <div class="flex w-2/3 mt-1 rounded-md shadow-sm">
            <div
              class="relative flex items-stretch flex-grow focus-within:z-10"
            >
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
    <div>
      <div class="flex justify-end">
        <button
          @click="refresh"
          type="button"
          class="self-center px-5 py-3 text-lg font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm first-letter:inline-flex md:self-end md:text-sm h-fit hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          刷新
        </button>
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
  </div>
</template>

<style scoped>
a {
  @apply underline text-blue-600 hover:text-blue-800 visited:text-purple-600;
}
</style>
