<script setup lang="ts">
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import { RefreshIcon } from "@heroicons/vue/solid";

import { useStore } from "vuex";
import { inject, onMounted, ref, Ref } from "@vue/runtime-core";
import { getAllProducts } from "@/store/firebaseControl";

const isShowMask: Ref<boolean> = inject("isShowMask") as Ref<boolean>;
const store = useStore();
const allProducts: Ref<any> = ref({});

onMounted(() => {
  console.log("store.state.allProducts:", store.state.allProducts);
  allProducts.value = store.state.allProducts;
});

function updateProductMax(e: any) {
  console.log("updateProductMax", e.target.value);
  console.log((document.getElementById(e.target.id) as any).value);

  if (e.target.value > allProducts.value[e.target.id].price) {
    (document.getElementById(e.target.id) as any).value =
      allProducts.value[e.target.id].price;
  } else if (e.target.value < 1) {
    (document.getElementById(e.target.id) as any).value = 0;
  } else {
    (document.getElementById(e.target.id) as any).value = parseInt(
      e.target.value.toString()
    );
  }

  console.log((document.getElementById(e.target.id) as any).value);
  allProducts.value[e.target.id].max =
    (document.getElementById(e.target.id) as any).value /
    allProducts.value[e.target.id].price;

  console.log("max:", allProducts.value[e.target.id].max);
  store.commit("setAllProducts", allProducts);
}

async function setProductMaxToDb() {
  console.log("setProductMaxToDbsss");
  isShowMask.value = true;
  let promises: any[] = [];

  for (let key in store.state.allProducts) {
    let docRef = doc(getFirestore(), `products/${key}`);

    promises.push(
      updateDoc(docRef, {
        max:
          Math.floor(
            parseFloat(
              ((store.state.allProducts[key].max * 10000) / 100).toFixed(2)
            )
          ) / 100,
      })
    );
  }

  try {
    await Promise.all(promises);
    alert("設定完成");
  } catch (e) {
    console.log(e);
    alert("設定失敗");
  }
  isShowMask.value = false;
}

async function onProductRefresh() {
  isShowMask.value = true;
  var allProducts = await getAllProducts();
  store.commit("setAllProducts", allProducts);
  isShowMask.value = false;
}
</script>

<template>
  <div class="my-[10vh] container mx-auto">
    <!-- <div class="text-xl text-red-500">
      <div>* 此頁為調整產品基本分潤%數，與給予下線的分潤%數並不相同。</div>
      <div>* 此%數於調整後12小時後開始計算，已進行結帳的訂單不會列入計算</div>
    </div> -->

    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col mt-8">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full text-center divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      產品名稱
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      產品價格
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      產品最高分潤金額
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      產品最高分潤%數
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <div
                        class="bg-opacity-0 hover:bg-opacity-50 active:bg-gray-400 transition-all bg-gray-300 w-fit rounded-full p-[5px] flex justify-center items-center"
                      >
                        <button class="w-4" @click="onProductRefresh">
                          <RefreshIcon />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, key, index) in allProducts" :key="index">
                    <td
                      class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                    >
                      {{ allProducts[key].displayName }}
                    </td>
                    <td
                      class="px-3 py-4 text-sm text-gray-500 whitespace-nowrap"
                    >
                      {{ allProducts[key].price }}
                    </td>
                    <td class="py-4 text-sm text-gray-500 whitespace-nowrap">
                      <input
                        class="text-center"
                        type="number"
                        min="0"
                        :max="allProducts[key].price"
                        :id="key.toString()"
                        @input="updateProductMax"
                        :value="
                          Math.floor(
                            allProducts[key].price * allProducts[key].max
                          )
                        "
                      />
                    </td>
                    <td
                      class="flex justify-center px-3 py-4 text-sm text-gray-500"
                    >
                      <div class="flex gap-5 items-center">
                        <div class="ml-5">
                          {{ Math.floor(allProducts[key].max * 100) }}
                          %
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full flex justify-end">
        <button
          type="button"
          @click="setProductMaxToDb"
          class="inline-flex items-center px-3 py-2 mt-5 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          修改
        </button>
      </div>
    </div>
  </div>
</template>

<style></style>
