<script setup lang="ts">
import { onMounted, ref, provide } from "vue";
import { getOrdersByDateRange } from "@/store/firebaseControl";
import { useStore } from "vuex";
import moment from "moment";
import { getFirestore, updateDoc, doc, getDoc } from "firebase/firestore";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import DownlinesOrderCommissionModal from "@/components/DownlinesOrderCommissionModal.vue";
const startDate: any = ref(
  new Date(
    parseInt(moment().format("YYYY")),
    parseInt(moment().format("MM")) - 3,
    1
  )
);
const dsIsOpen = ref(false);
provide("dsIsOpen", dsIsOpen);
const endDate: any = ref(new Date());
const db = getFirestore();
const store = useStore();
const queryOrderTarget: any = ref();
const orders: any = ref([]);
onMounted(async () => {
  console.log("report");
  console.log("store:", store.state.downlines);
  console.log(store.state.userInfo.role);
});
function checkDownlineCommission() {
  console.log("test", dsIsOpen.value);

  dsIsOpen.value = !dsIsOpen.value;
}

async function queryOrder() {
  console.log("queryOrder");
  if (queryOrderTarget.value.value == "false") {
    alert("請選擇對象");
    return;
  }
  orders.value = [];
  const targets = queryOrderTarget.value.value.split(",");
  console.log("targets:", targets);
  let tempOrders = await getOrdersByDateRange(
    targets,
    moment(startDate.value).valueOf(),
    moment(endDate.value).valueOf()
  );
  tempOrders = Object.values(tempOrders);
  console.log(tempOrders);
  tempOrders.forEach((o: any) => {
    orders.value = [...orders.value, ...o];
  });

  if (store.state.userInfo.role == "admin") {
    orders.value.forEach((o: any, i: number) => {
      let commissionMax: number = 0;
      let orderItems = Object.values(o.items);
      let totalProfit = 0;
      orderItems.forEach((item: any) => {
        commissionMax += item.max;
      });
      console.log("max:", commissionMax);
      totalProfit =
        parseInt(o.amount) -
        commissionMax +
        o.totalCommissions[store.state.userInfo.urlsuffix];
      console.log("訂單盈餘:", totalProfit);
      orders.value[i]["totalProfit"] = totalProfit;
    });
  }

  if (orders.value.length < 1) {
    alert("查無訂單");
  }
  console.log("orders:", orders.value);
}
</script>

<template>
  <div class="flex items-center justify-center w-full h-screen p-5">
    <DownlinesOrderCommissionModal />
    <div>
      <div>report{{ store.state.userInfo.urlsuffix }}</div>
      <div class="flex gap-12">
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700"
            >選擇查詢對象</label
          >
          <select
            ref="queryOrderTarget"
            id="location"
            name="location"
            class="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option selected disabled :value="false">請選擇查詢對象</option>
            <option
              v-if="store.state.userInfo.role == 'admin'"
              :value="Object.keys(store.state.downlines)"
            >
              查詢全部
            </option>
            <option
              v-if="store.state.userInfo.role == 'kol'"
              :value="store.state.userInfo.urlsuffix"
            >
              自己的訂單
            </option>
            <option v-for="(downline, key) in store.state.downlines" :key="key">
              {{ downline.urlsuffix }}
            </option>
          </select>
        </div>

        <div class="flex gap-5">
          <div>
            <div>搜尋起始時間</div>
            <Datepicker
              placeholder="Select Date"
              v-model="startDate"
            ></Datepicker>
          </div>

          <div>
            <div>搜尋結束時間</div>
            <Datepicker
              placeholder="Select Date"
              v-model="endDate"
            ></Datepicker>
          </div>
        </div>

        <button
          @click="queryOrder"
          type="button"
          class="self-center h-fit inline-flex items-center px-5 py-3 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          查詢
        </button>
      </div>
      <div class="mt-12">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">訂單資訊</h1>
            <!-- <p class="mt-2 text-sm text-gray-700">
              A list of all the users in your account including their name,
              title, email and role.
            </p> -->
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
                        訂單時間
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        URLSuffix
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
                        我的抽成
                      </th>
                      <th
                        v-if="store.state.userInfo.role == 'admin'"
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        訂單盈餘
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        下線抽成
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(order, index) in orders" :key="index">
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ moment(order.createdAt).format("YYYY/MM/DD") }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ order.urlsuffix }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ order.amount }}
                      </td>

                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{
                          order.totalCommissions[store.state.userInfo.urlsuffix]
                        }}
                      </td>
                      <td
                        v-if="store.state.userInfo.role == 'admin'"
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ order.totalProfit }}
                      </td>
                      <td
                        @click="checkDownlineCommission(order.id)"
                        class="cursor-pointer py-4 pl-4 pr-3 text-sm font-medium text-blue-500 whitespace-nowrap sm:pl-6"
                      >
                        點擊查看詳細
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
