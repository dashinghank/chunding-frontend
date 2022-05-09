<script setup lang="ts">
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { useStore } from "vuex";
import { onMounted, ref, Ref } from "@vue/runtime-core";

const store = useStore();
const allProducts: Ref<any> = ref({});

onMounted(() => {
  allProducts.value = store.state.allProducts;
});

function updateProductMax(e: any) {
  console.log((parseInt(e.target.value) / 100).toFixed(2));
  store.state.allProducts[e.target.id].max = parseFloat(
    (parseInt(e.target.value) / 100).toFixed(2)
  );

  store.commit("setAllProducts", allProducts);

  console.log(store.state.allProducts[e.target.id]);
}

async function setProductMaxToDb() {
  let promises: any[] = [];

  for (let key in store.state.allProducts) {
    let docRef = doc(getFirestore(), `members/${key}`);
    promises.push(
      updateDoc(docRef, {
        max: store.state.allProducts[key].max,
      })
    );
  }

  await Promise.all(promises);
}
</script>

<template>
  <div class="mt-[10vh] container mx-auto">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col mt-8">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
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
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      產品名稱
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      產品價格
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      產品分潤金額
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      產品分潤%數
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, key, index) in allProducts" :key="key">
                    <td
                      class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                    >
                      {{ allProducts[key].displayName }}
                    </td>
                    <td
                      class="px-3 py-4 text-sm text-center text-gray-500 whitespace-nowrap"
                    >
                      {{ allProducts[key].price }}
                    </td>
                    <td
                      class="px-3 py-4 text-sm text-center text-gray-500 whitespace-nowrap"
                    >
                      {{
                        Math.ceil(allProducts[key].price * allProducts[key].max)
                      }}
                    </td>
                    <td
                      class="px-3 py-4 text-sm text-gray-500 whitespace-nowrap"
                    >
                      <div class="flex gap-5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          :id="key.toString()"
                          @change="updateProductMax"
                          :value="allProducts[key].max * 100"
                        />
                        <div>{{ Math.ceil(allProducts[key].max * 100) }} %</div>
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
    <div>
      <button
        type="button"
        @click="setProductMaxToDb"
        class="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        更新
      </button>
    </div>
  </div>
</template>

<style></style>
