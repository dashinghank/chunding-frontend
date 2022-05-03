<script setup lang="ts">
import { getFirestore, updateDoc, doc, getDoc } from "firebase/firestore";

import moment from "moment";
import { getOrdersByDateRange } from "@/store/firebaseControl";

import { onMounted, ref } from "vue";
import { useStore } from "vuex";

const db = getFirestore();
const period = ref();
const store = useStore();
const orders = ref([]);
const selectedDownline = ref();
const selectedProduct = ref();
const selectedPercentage = ref();

onMounted(async () => {
  console.log("全部下線");
  console.log(store.state.downlines);
  console.log(moment("2022/03/23", "YYYY/MM/DD").valueOf());
  console.log(moment(1647964800000).format("YYYY/MM/DD"));
});

async function orderQuery() {
  console.log("orderQuery");
  let urlsuffixs = [
    ...Object.keys(store.state.downlines),
    store.state.userInfo.uid,
  ];
  console.log(period.value.value);
  var date = new Date();
  if (period.value.value == 1) {
    let startDate = moment(
      `${date.getFullYear()}/${date.getMonth() + 1}/1`,
      "YYYY/MM/DD"
    ).valueOf();

    let endDate = moment().valueOf();
    let downlinesOrders = await getOrdersByDateRange(
      urlsuffixs,
      startDate,
      endDate
    );

    let temp: any = [];
    Object.values(downlinesOrders).forEach((orders: any) => {
      orders.forEach((order: any) => {
        console.log("這是一筆訂單:", order.items);
        temp.push(order);
      });
    });
    orders.value = temp;
  } else {
    let startDate = moment(
      `${date.getFullYear()}/${date.getMonth()}/1`,
      "YYYY/MM/DD"
    ).valueOf();

    let endDate = moment(getLastMonthAndDay(), "YYYY/MM/DD").valueOf();
    let downlinesOrders = await getOrdersByDateRange(
      urlsuffixs,
      startDate,
      endDate
    );

    let temp: any = [];
    Object.values(downlinesOrders).forEach((orders: any) => {
      orders.forEach((order: any) => {
        console.log("這是一筆訂單:", order.items);
        temp.push(order);
      });
    });
    orders.value = temp;
    console.log(orders.value.values);
  }
  // await getOrdersByDateRange(urlsuffixs,)
}
function getLastMonthAndDay() {
  var nowDate = new Date();
  var year = nowDate.getFullYear();
  var month = nowDate.getMonth();
  if (month == 0) {
    month = 12;
    year = year - 1;
  }
  var lastDay = new Date(year, month, 0);
  var yyyyMmDd = year + "/" + month + "/" + lastDay.getDate();
  return yyyyMmDd;
}

// 是大雄要針對下線做調整抽成影響
async function modifyProductCommision() {
  console.log("modifyProductCommision");
  // console.log(selectedProduct.value.value);
  // console.log(selectedPercentage.value.value);
  console.log(selectedDownline.value.value);
  console.log(store.state.userInfo.docId);

  const docRef = doc(getFirestore(), `members/${store.state.userInfo.docId}`);
  const docSnapshot = await getDoc(docRef);
  let myData: any = docSnapshot.data();

  // if (Object.keys(myData.downlines).length > 0) {
  //   if (Object.keys(myData.downlines).includes(selectedDownline.value.value)) {
  //     console.log("有這個下線");
  //     if (
  //       Object.keys(myData.downlines[selectedDownline.value.value]).includes(
  //         selectedProduct.value.value
  //       )
  //     ) {
  //       myData.downlines[selectedDownline.value.value][
  //         selectedProduct.value.value
  //       ] = parseFloat(selectedPercentage.value.value);
  //     } else {
  //       myData.downlines[selectedDownline.value.value][
  //         selectedProduct.value.value
  //       ] = parseFloat(selectedPercentage.value.value);
  //     }
  //   } else {
  //     console.log("myData.downlines:", myData.downlines);
  //     myData.downlines[selectedDownline.value.value] = {
  //       [selectedProduct.value.value]: parseFloat(
  //         selectedPercentage.value.value
  //       ),
  //     };
  //   }
  // }

  // await updateDoc(docRef, {
  //   downlines: myData.downlines,
  // });
}
</script>

<template>
  <div class="flex justify-center w-full h-screen items-center">
    <div>
      <div>下線數量:{{ Object.keys(store.state.downlines).length }}</div>

      <div v-if="Object.keys(store.state.downlines).length > 0">
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
      <div class="px-4 sm:px-6 lg:px-8 mt-5">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">訂單資訊</h1>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >選擇要查詢的日期</label
              >
              <select
                ref="period"
                class="p-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option :value="0">上個月業績</option>
                <option :value="1" selected>這個月業績</option>
              </select>
            </div>
            <button
              type="button"
              @click="orderQuery"
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
                    <tr v-for="(order, index) in orders" :key="index">
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        {{ (order as any).name }}
                      </td>
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        {{ (order as any).customer }}
                      </td>
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        {{ moment((order as any).createdAt).format('YYYY/MM/DD') }}
                      </td>
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        {{ parseInt((order as any).amount) }}
                      </td>
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        {{ parseInt((order as any).selfCommission) }}
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
