<script setup lang="ts">
import { ref, provide, onMounted, inject, Ref } from "vue";
import { getOrdersByDateRange } from "@/store/firebaseControl";
import { useStore } from "vuex";
import moment from "moment";
import { getFirestore } from "firebase/firestore";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import DownlinesOrderCommissionModal from "@/components/DownlinesOrderCommissionModal.vue";
import { Chart, registerables } from "chart.js";
import _, { parseInt } from "lodash";

Chart.register(...registerables);

const startDate: any = ref(
  new Date(
    parseInt(moment().format("YYYY")),
    parseInt(moment().format("MM")) - 3,
    1
  )
);
const dsIsOpen = ref(false);
const commissionDetail: any = ref({});
const endDate: any = ref(new Date());
const db = getFirestore();
const store = useStore();
const queryOrderTarget: any = ref();
const orders: any = ref([]);
const allMembers = ref();
const isShowMask = inject("isShowMask") as Ref<boolean>;
provide("dsIsOpen", dsIsOpen);
provide("commissionDetail", commissionDetail);
provide("allMembers", allMembers);
onMounted(() => {
  allMembers.value = { ...store.state.downlines };
  allMembers.value[store.state.userInfo.urlsuffix] = store.state.userInfo;
  console.log(allMembers.value);
});
function checkDownlineCommission(order: any) {
  console.log("order:", order);
  let interSectionUrlsuffixs = _.intersection(
    Object.keys(allMembers.value),
    Object.keys(order.totalCommissions)
  );

  console.log("=================================");
  console.log(order.totalCommissions);
  console.log("=================================");
  console.log(interSectionUrlsuffixs);
  console.log("=================================");
  interSectionUrlsuffixs.forEach((suffix) => {
    commissionDetail.value[suffix] = order.totalCommissions[suffix];
  });

  console.log("commissionDetail.value :", commissionDetail.value);
  dsIsOpen.value = !dsIsOpen.value;
}

async function queryOrder() {
  if (queryOrderTarget.value.value == "false") {
    alert("請選擇對象");
    return;
  }

  isShowMask.value = true;
  console.log(queryOrderTarget.value.value);
  orders.value = [];
  let targets = [];

  if (queryOrderTarget.value.value == "all") {
    targets = Object.keys(allMembers.value);
    if (store.state.userInfo.role == "admin") {
      targets.push("none");
    }
  } else {
    targets.push(queryOrderTarget.value.value);
  }

  let tempOrders = await getOrdersByDateRange(
    targets,
    moment(startDate.value).valueOf(),
    moment(endDate.value).valueOf()
  );
  tempOrders = Object.values(tempOrders);
  tempOrders.forEach((o: any) => {
    orders.value = [...orders.value, ...o];
  });

  if (orders.value.length < 1) {
    alert("查無訂單");
  }

  if (store.state.userInfo.role == "admin") {
    orders.value.forEach((o: any, i: number) => {
      let commissionMax: number = 0;
      let orderItems = Object.values(o.items);
      let totalProfit = 0;

      orderItems.forEach((item: any) => {
        commissionMax += item.price * item.max * item.quantity;
      });
      console.log("max:", commissionMax);
      console.log("mine:", o.totalCommissions[store.state.userInfo.urlsuffix]);

      totalProfit =
        parseInt(o.amount) -
        commissionMax +
        o.totalCommissions[store.state.userInfo.urlsuffix];
      console.log("訂單盈餘:", totalProfit);
      orders.value[i]["totalProfit"] = totalProfit;
    });
  }
  Object.keys(allMembers.value).forEach((member) => {
    var memberCommission = 0;
    orders.value.forEach((order: any) => {
      if (order.totalCommissions[member]) {
        console.log(member, ":", order.totalCommissions[member]);
        memberCommission += parseInt(order.totalCommissions[member]);
      }
    });
    console.log("現在會員:", member, ":", memberCommission);
    allMembers.value[member]["commission"] = memberCommission;
  });
  console.log("order:", orders.value);
  console.log("allMembers:", allMembers.value);

  console.log("orders:", orders.value);
  orders.value = _.orderBy(orders.value, "createdAt", "desc");
  isShowMask.value = false;
}
</script>

<template>
  <div class="container mx-auto mt-[10vh]">
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
            <option selected disabled hidden :value="false">
              請選擇查詢對象
            </option>
            <option value="all">查詢全部</option>

            <option
              v-for="(member, key) in allMembers"
              :value="member.urlsuffix"
              :key="key"
            >
              {{
                member.urlsuffix == store.state.userInfo.urlsuffix
                  ? "自己"
                  : member.nickname
              }}
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
          class="inline-flex items-center self-center px-5 py-3 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm h-fit hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                        暱稱
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
                        公司總獲利
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        詳細抽成
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
                        {{
                          order.urlsuffix == "none"
                            ? "自然流量"
                            : allMembers[order.urlsuffix].nickname
                        }}
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
                        @click="checkDownlineCommission(order)"
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

      <div class="mt-12" v-show="orders.length > 0">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">會員資訊</h1>
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
                        URLSuffix
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        暱稱
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        當期分紅
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(member, index) in allMembers" :key="index">
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ member.urlsuffix }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ member.nickname }}
                      </td>
                      <td
                        class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                      >
                        {{ member.commission }}
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
