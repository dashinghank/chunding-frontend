<script setup lang="ts">
import { getFirestore } from "firebase/firestore";
import moment from "moment";
import { getOrdersByDateRange, getAllDownlines } from "@/store/firebaseControl";

import { onMounted, ref } from "vue";
import { useStore } from "vuex";

const db = getFirestore();
const period = ref();
const store = useStore();
const orders = ref([]);
onMounted(async () => {
  console.log("全部下線");
  console.log(moment("2022/03/23", "YYYY/MM/DD").valueOf());
  console.log(moment(1647964800000).format("YYYY/MM/DD"));
});

async function orderQuery() {
  console.log("orderQuery");

  let allDownlines: any = await getAllDownlines(
    [{ urlsuffix: store.state.userInfo.urlsuffix }],
    1
  );
  let urlsuffixs = allDownlines.map((item) => item.urlsuffix);

  console.log("urlsuffixs", urlsuffixs);

  console.log(period.value.value);
  if (urlsuffixs.length > 0) {
    var date = new Date();
    if (period.value.value == 1) {
      let startDate = moment(
        `${date.getFullYear()}/${date.getMonth() + 1}/1`,
        "YYYY/MM/DD"
      ).valueOf();

      let endDate = moment().valueOf();
      console.log(urlsuffixs);
      let downlinesOrders = await getOrdersByDateRange(
        urlsuffixs,
        startDate,
        endDate
      );

      console.log("downlinesOrders", downlinesOrders);

      let temp: any = [];
      Object.values(downlinesOrders).forEach((orders: any) => {
        orders.forEach((order: any) => {
          console.log("這是一筆訂單:", order.items);
          Object.entries(order.items).forEach(([key, value]) => {
            console.log("value", value);
          });
          temp.push(order);
        });
      });
      console.log("temp", temp);
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
          let tempCommision = 0;
          Object.entries(order.items).forEach(([key, value]) => {
            tempCommision +=
              store.state.downlines[order.kolSuffix].products[key].commision *
              (value as any).quantity;
          });

          console.log("tempCommision:", tempCommision);
          console.log(store.state.downlines[order.kolSuffix].products);
          order["commision"] = tempCommision;
          temp.push(order);
        });
      });
      orders.value = temp;
    }
    if (orders.value.length == 0) {
      alert("查無資料");
    }
  }
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
</script>

<template>
  <div class="flex items-center justify-center w-full h-screen">
    <div>
      <div>下線數量:{{ Object.keys(store.state.downlines).length }}</div>

      <div
        class="px-4 mt-5 sm:px-6 lg:px-8"
        v-if="Object.keys(store.state.downlines).length > 0"
      >
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
                class="block w-full p-2 py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option :value="0">上個月業績</option>
                <option :value="1" selected>這個月業績</option>
              </select>
            </div>
            <button
              type="button"
              @click="orderQuery"
              class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              查詢
            </button>
          </div>
        </div>
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
                        下線訂單抽成
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        我抽下線訂單抽成
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(order, index) in orders" :key="index">
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ (order as any).name }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ (order as any).customer }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ moment((order as any).createdAt).format('YYYY/MM/DD') }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ parseInt((order as any).amount) }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ parseInt((order as any).selfCommission) }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ parseInt((order as any).parentCommission) }}
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
