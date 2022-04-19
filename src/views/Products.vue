<script setup lang="ts">
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { onMounted, ref } from "@vue/runtime-core";

interface IProduct {
  default: number;
  handle: string;
  price: string;
  sku: string;
  vid: string;
}
interface IProducts {
  [key: string]: IProduct;
}

const products = ref<IProducts>({});
const selected = ref(1);

onMounted(async () => {
  console.log("product in");
  await getProducts();
});

async function getProducts() {
  var productsRef = await getDocs(collection(getFirestore(), "products"));
  productsRef.forEach((doc) => {
    console.log("user data:", doc.id, doc.data());
    products.value[doc.id] = doc.data() as IProduct;
  });
}
async function modifyProductDefult(key: string) {
  console.log("modifyProductDefult", key);

  const docRef = doc(getFirestore(), `products/${key}`);

  await updateDoc(docRef, {
    default: document.getElementById(key)?.value,
  });
  await getProducts();
}
</script>

<template>
  <div class="mt-[10%] flex gap-10 justify-center flex-wrap">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">調整商品抽成%數</h1>
          <!-- <p class="mt-2 text-sm text-gray-700">
            A table of placeholder stock market data that does not make any
            sense.
          </p> -->
        </div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      商品名稱
                    </th>
                    <th
                      scope="col"
                      class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      sku
                    </th>
                    <th
                      scope="col"
                      class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      抽成
                    </th>
                    <th
                      scope="col"
                      class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      價格
                    </th>
                    <th
                      scope="col"
                      class="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span>設定%數</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="(product, index) in products" :key="index">
                    <td
                      class="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6"
                    >
                      {{ product.handle }}
                    </td>
                    <td
                      class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900"
                    >
                      {{ product.sku }}
                    </td>
                    <td
                      class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900"
                    >
                      {{ product.default }}
                    </td>
                    <td
                      class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900"
                    >
                      {{ product.price }}
                    </td>

                    <td
                      class="relative grid grid-cols-2 py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      <div class="p-3">
                        <select
                          :id="index.toString()"
                          name="location"
                          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option
                            v-for="n in [
                              0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
                            ]"
                            :key="n"
                          >
                            {{ n }}
                          </option>
                        </select>
                      </div>
                      <div class="w-full p-3">
                        <button
                          @click="modifyProductDefult(index.toString())"
                          class="text-indigo-600 hover:text-indigo-900 w-full border-2 py-2 px-4 rounded-lg border-indigo-600"
                        >
                          <span>調整數據</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
