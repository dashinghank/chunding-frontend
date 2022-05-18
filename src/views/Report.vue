<script setup lang="ts">
import { ref, provide, onMounted, inject, Ref } from "vue";
import { getOrdersByDateRange } from "@/store/firebaseControl";
import { useStore } from "vuex";
import moment from "moment";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import DownlinesOrderCommissionModal from "@/components/DownlinesOrderCommissionModal.vue";
import { Chart, registerables } from "chart.js";
import _, { parseInt } from "lodash";

Chart.register(...registerables);
//----input ref----
const startDate: any = ref(
  new Date(
    parseInt(moment().format("YYYY")),
    parseInt(moment().format("MM")) - 3,
    1
  )
);
const endDate: any = ref(new Date());
const queryOrderTarget: any = ref();

//---- data ref ----
const commissionDetail: any = ref({});
const isShowMask = inject("isShowMask") as Ref<boolean>;
//自己所有的下線加上自己
const allFamilyMembers = ref();
const currentOrders: any = ref([]);
const isDetailOpen = ref(false);

const store = useStore();

provide("isDetailOpen", isDetailOpen);
provide("commissionDetail", commissionDetail);
provide("allFamilyMembers", allFamilyMembers);

onMounted(() => {
  allFamilyMembers.value = { ...store.state.downlines };
  allFamilyMembers.value[store.state.userInfo.urlsuffix] = store.state.userInfo;
});

function checkDownlineCommission(order: any) {
  let interSectionUrlsuffixs = _.intersection(
    Object.keys(allFamilyMembers.value),
    Object.keys(order.totalCommissions)
  );

  interSectionUrlsuffixs.forEach((suffix) => {
    commissionDetail.value[suffix] = order.totalCommissions[suffix];
  });

  isDetailOpen.value = !isDetailOpen.value;
}

async function queryOrder() {
  if (queryOrderTarget.value.value == "false") {
    alert("請選擇對象");
    return;
  }

  isShowMask.value = true;
  currentOrders.value = [];
  //查詢對象
  let targets = [];

  if (queryOrderTarget.value.value == "all") {
    targets = Object.keys(allFamilyMembers.value);
    if (store.state.userInfo.role == "admin") {
      //urlsuffix為 none時，代表客戶不是透過kol推廣網址來購買的
      targets.push("none");
    }
  } else {
    targets.push(queryOrderTarget.value.value);
  }

  let tempAllMembersOrders = await getOrdersByDateRange(
    targets,
    moment(startDate.value).valueOf(),
    moment(endDate.value).valueOf()
  );

  /*tempAllMembersOrders 的 example :
  {
    test001: [{ ...order1 }, { ...order2 }],
    test002: [{ ...order3 }],
  };
  */
  //這裡的是為了把 tempAllMembersOrders 變成 [order1,order2,order3],再將這個值存入 currentOrders;
  let tempAllOrders = Object.values(tempAllMembersOrders);
  tempAllOrders.forEach((orders: any) => {
    currentOrders.value = [...currentOrders.value, ...orders];
  });

  if (currentOrders.value.length < 1) {
    alert("查無訂單");
  }

  if (store.state.userInfo.role == "admin") {
    currentOrders.value.forEach((o: any, i: number) => {
      //此訂單所有下線可取得的最高分成
      let commissionMax: number = 0;
      let orderItems = Object.values(o.items);
      let totalProfit = 0;

      orderItems.forEach((item: any) => {
        commissionMax += item.price * item.max * item.quantity;
      });
      //公司獲利 = 訂單金額 - 此訂單所有下線可取得的最高分成 + ADMIN 的分成
      totalProfit =
        parseInt(o.amount) -
        commissionMax +
        o.totalCommissions[store.state.userInfo.urlsuffix];

      currentOrders.value[i]["totalProfit"] = totalProfit;
    });
  }
  //如果是 KOL 登入
  else {
    Object.keys(allFamilyMembers.value).forEach((member) => {
      //特定 kol 可在此單下得到的分成
      let memberCommission = 0;
      currentOrders.value.forEach((order: any) => {
        if (order.totalCommissions[member]) {
          memberCommission += parseInt(order.totalCommissions[member]);
        }
      });
      allFamilyMembers.value[member]["commission"] = memberCommission;
    });
  }
  currentOrders.value = _.orderBy(currentOrders.value, "createdAt", "desc");
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
              v-for="(member, key) in allFamilyMembers"
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
                    <tr v-for="(order, index) in currentOrders" :key="index">
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
                            : allFamilyMembers[order.urlsuffix].nickname
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

      <div class="mt-12" v-show="currentOrders.length > 0">
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
                    <tr
                      v-for="(member, index) in allFamilyMembers"
                      :key="index"
                    >
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
