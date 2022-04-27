<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getOrdersByDateRange, getAllDownlines } from "@/store/firebaseControl";
import { useStore } from "vuex";
import moment from "moment";
import {
  getFirestore,
  collection,
  // addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
const db = getFirestore();

const store = useStore();
const selectedDownline = ref();
const selectedProduct = ref();
const selectedPercentage = ref();
const orders = ref({});

onMounted(async () => {
  console.log("report");
  var startDate = moment("2022/03/26", "YYYY/MM/DD").valueOf();
  var endDate = moment().valueOf();
  // console.log(moment().valueOf());
  // console.log(moment(1650038400000).format("YYYY/MM/DD HH:mm:ss"));
  orders.value = await getOrdersByDateRange(
    [store.state.userInfo.uid],
    startDate,
    endDate
  );
  if (Object.keys(orders.value as any).length > 0) {
    console.log("allproducts:", store.state.userInfo.products);
    console.log("store.state.userInfo.uid:", store.state.userInfo.uid);
    console.log("orders.value:", orders.value);
    console.log(
      "orders.value:",
      (orders.value as any)[store.state.userInfo.uid]
    );
    (orders.value as any)[store.state.userInfo.uid].forEach(
      (order: any, i: any) => {
        var tempCommision = 0;
        Object.entries(order.items).forEach(([key, value]) => {
          console.log(
            "總抽成:",
            store.state.userInfo.products[key].commision *
              (value as any).quantity
          );

          tempCommision +=
            store.state.userInfo.products[key].commision *
            (value as any).quantity;
          console.log("key:", key);
          console.log("value:", value);
        });

        (orders.value as any)[store.state.userInfo.uid][i]["commision"] =
          tempCommision;
        console.log("tempCommision:", tempCommision);
      }
    );
  }
});

async function modifyProductCommision() {
  console.log("modifyProductCommision");
  console.log(selectedDownline.value.value);
  console.log(selectedProduct.value.value);
  console.log(selectedPercentage.value.value);

  store.commit("setDownlineProduct", {
    urlsuffix: selectedDownline.value.value,
    productId: selectedProduct.value.value,
    percentage: selectedPercentage.value.value,
  });

  const docRef = doc(
    getFirestore(),
    `members/${store.state.downlines[selectedDownline.value.value].docId}`
  );

  await updateDoc(docRef, {
    products: store.state.downlines[selectedDownline.value.value].products,
  });
}
</script>

<template>
  <div class="flex justify-center w-full h-screen items-center">
    <div>
      <div>
        <div>這是你的推廣網址:</div>
        <div>
          https://chyuinding.myshopify.com/?kolsuffix={{ store.state.uid }}
        </div>
      </div>

      <div>
        <div>調整商品的抽成:</div>
        <div class="p-2">
          <label class="block text-sm font-medium text-gray-700"
            >選擇下線</label
          >
          <select
            ref="selectedDownline"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option selected disabled>選擇要調整的KOL</option>
            <option
              v-for="(downline, index) in store.state.downlines"
              :key="index"
              :value="downline.urlsuffix"
            >
              {{ downline.nickname }}
            </option>
          </select>
        </div>
        <div class="p-2">
          <label class="block text-sm font-medium text-gray-700"
            >選擇商品</label
          >
          <select
            ref="selectedProduct"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option selected disabled>選擇要調整的商品</option>
            <option
              v-for="(product, key, index) in store.state.allProducts"
              :key="index"
              :value="key"
            >
              {{ product.handle }}
            </option>
          </select>
        </div>
        <div class="p-2">
          <label class="block text-sm font-medium text-gray-700">選擇%數</label>
          <select
            ref="selectedPercentage"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option selected disabled>選擇要調整的趴數</option>
            <option
              v-for="(number, index) in [
                0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
              ]"
              :key="index"
            >
              {{ number }}
            </option>
          </select>
        </div>
        <div class="p-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            @click="modifyProductCommision"
          >
            調整
          </button>
        </div>
      </div>
      <div>下線數量:{{ Object.keys(store.state.downlines).length }}</div>
      <div>上次訂單更新時間:</div>

      <div class="px-4 sm:px-6 lg:px-8 mt-10">
        <div class="sm:flex sm:items-center min-w-[350px] sm:min-w-[880px]">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">訂單資訊</h1>
          </div>

          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              查詢
            </button>
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
                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        訂單編號
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        客戶名稱
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        訂單日期
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        訂單金額
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        訂單抽成
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr
                      v-for="(order, index) in orders[store.state.userInfo.uid]"
                      :key="index"
                    >
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        {{ order.name }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ order.customer }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ moment(order.createdAt).format("YYYY/MM/DD") }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ parseInt(order.amount) }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ order.commision }}
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
  </div>
</template>

<style></style>
