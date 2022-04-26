<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getOrdersByDateRange, getAllDownlines } from "@/store/firebaseControl";
import { useStore } from "vuex";
import moment from "moment";

const store = useStore();
const orders = ref({});

onMounted(async () => {
  console.log("reportDownline");

  var startDate = moment("2022/03/26", "YYYY/MM/DD").valueOf();
  var endDate = moment().valueOf();
  var downlinesUrls = Object.keys(store.state.downlines);
  var originOrders = await getOrdersByDateRange(
    downlinesUrls,
    startDate,
    endDate
  );
  console.log(originOrders);
  var tempOrders: any = [];
  Object.entries(originOrders).forEach(([key, value]) => {
    (value as any).forEach((d: any) => {
      console.log("key:", store.state.downlines[key].nickname);

      tempOrders.push({ ...d, nickname: store.state.downlines[key].nickname });
    });
  });
  console.log(tempOrders);
  orders.value = tempOrders;

  //   var tempCommision = 0;
  //   Object.entries(order.items).forEach(([key, value]) => {
  //     tempCommision +=
  //       store.state.userInfo.products[key].commision * (value as any).quantity;
  //   });
  //   (orders.value as any)[store.state.userInfo.uid][i]["commision"] =
  //     tempCommision;
  // });
});
</script>

<template>
  <div class="flex justify-center w-full h-screen items-center">
    <div>
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
                        下線名稱
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
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ (order as any).customer }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ moment((order as any).createdAt).format("YYYY/MM/DD") }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ parseInt((order as any).amount) }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ (order as any).nickname }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ (order as any).commision }}
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
