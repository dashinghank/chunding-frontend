<script lang="ts" setup>
import { inject, onMounted, provide, Ref, ref } from "vue";
import { useStore } from "vuex";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import axios from "axios";
import KolListComponentVue from "@/components/kolListComponent.vue";
import { getDoughnut, destroyChart } from "../store/doughnut";
import { getAllDownlines } from "@/store/firebaseControl";
let store = useStore();

// ===== data ref =====
const isShowMask = inject("isShowMask") as Ref<boolean>;
let allDownlinesRef = ref();
let allMyMembersRef = ref();
let currentSelectSuffix = ref("");
let ancestorsRef = ref();
let nicknameRef = ref();
let commissionPercentageRef = ref();

//分成公式, 詳細列出每家可分成的%數
const commissionFormulaRef: Ref<any[]> = ref([]);
const maxCommissionRef: Ref<number> = ref(0);
const minCommissionRef: Ref<number> = ref(0);

const currentSelectMember = ref() as Ref<string>;

// ===== canvas refs =====
const doughnutCanvas = ref();
// ===== example refs =====
const exampleSuffixs = ref();

// ===== input ref =====
let selectDownlineRef = ref();
const nickname = ref("");
const password = ref("");
const urlsuffix = ref("");
const role = ref("");
const depth = ref(-1);
const instaId = ref("");
const lineId = ref("");
const kolName = ref("");
const phoneNumber = ref("");
const commissionPercentage = ref(0);

// ====== element ref ======
const currentSuffix: Ref<string> = ref("");

provide("currentSelectMember", currentSelectMember);
provide("onDownlineChangeClick", onDownlineChangeClick);

onMounted(() => {
  allDownlinesRef.value = Object.values(store.state.downlines);
  allMyMembersRef.value = { ...store.state.downlines };
  allMyMembersRef.value[store.state.userInfo.urlsuffix] = store.state.userInfo;
});

async function onSubmit() {
  console.log(allMyMembersRef.value);
  console.log(currentSuffix.value);
  // console.log(currentSuffix.value);
  try {
    isShowMask.value = true;

    let result = await axios.post(
      "https://shopify-api-nine.vercel.app/api/updateMember",
      {
        docId: `${allMyMembersRef.value[currentSuffix.value].docId}`,
        nickname: nickname.value,
        commissionPercentage: commissionPercentage.value / 100,
      }
    );

    if (result.data.status == "000") {
      allMyMembersRef.value[currentSuffix.value].nickname = nickname.value;
      allMyMembersRef.value[currentSuffix.value].commissionPercentage =
        commissionPercentage.value / 100;
      alert("修改成功");
      let allPromises = [getAllDownlines(store.state.userInfo.urlsuffix)];

      let results = await Promise.all(allPromises);
      var downlines = results[0];
      if (downlines.length > 0) {
        downlines.forEach((downline: any) => {
          store.commit("setDownline", downline);
        });
      }
    } else {
      alert("修改失敗");
    }
  } catch (e: any) {
    alert("修改失敗:" + e.message);
    isShowMask.value = false;

    return;
  }
  isShowMask.value = false;

  destroyChart();
  allDownlinesRef.value = Object.values(store.state.downlines);
  allMyMembersRef.value = { ...store.state.downlines };
  allMyMembersRef.value[store.state.userInfo.urlsuffix] = store.state.userInfo;
  onDownlineChange(currentSuffix.value);
}

// function onCommissionPercentageChange() {
//   if (commissionPercentageRef.value > maxCommissionRef.value) {
//     commissionPercentageRef.value = maxCommissionRef.value;
//   }
//   if (commissionPercentageRef.value < minCommissionRef.value) {
//     commissionPercentageRef.value = minCommissionRef.value;
//   }
// }
function onCommissionPercentageChange(e: any) {
  console.log(parseInt(e.target.value));
  console.log("maxCommissionRef.value:", maxCommissionRef.value);

  if (parseInt(e.target.value) > maxCommissionRef.value) {
    console.log("over");
    commissionPercentage.value = maxCommissionRef.value;
  } else if (parseInt(e.target.value) < minCommissionRef.value) {
    commissionPercentage.value = minCommissionRef.value;
  } else {
    commissionPercentage.value = parseInt(e.target.value);
  }

  e.target.value = commissionPercentage.value;
}

function clearAllInputs() {
  console.log("clearAllInputs");

  nickname.value = "";
  currentSuffix.value = "";
  urlsuffix.value = "";
  role.value = "";
  depth.value = -1;
  instaId.value = "";
  lineId.value = "";
  kolName.value = "";
  phoneNumber.value = "";

  // commissionPercentageRef.value.value = "";
}
function onDownlineChangeClick() {
  clearAllInputs();
  destroyChart();
  onDownlineChange(currentSelectMember.value);
}

function onDownlineChange(suffix: string) {
  console.log("suffix;", suffix);
  let member = allMyMembersRef.value[suffix];
  //計算分成公式
  commissionFormulaRef.value = [];

  for (let i = 0; i < member.ancestors.length; i++) {
    if (i < store.state.userInfo.depth) continue;
    commissionFormulaRef.value.push(
      allMyMembersRef.value[member.ancestors[i]].commissionPercentage
    );
  }

  //把自己加進去
  commissionFormulaRef.value.push(member.commissionPercentage);
  for (let i = 0; i < commissionFormulaRef.value.length; i++) {
    if (i + 1 < commissionFormulaRef.value.length) {
      commissionFormulaRef.value[i] = parseFloat(
        (
          commissionFormulaRef.value[i] - commissionFormulaRef.value[i + 1]
        ).toFixed(2)
      );
    }
  }
  let ancestorsNicknames = [];
  for (let i = 0; i < member.ancestors.length; i++) {
    if (i < store.state.userInfo.depth) continue;
    ancestorsNicknames.push(
      allMyMembersRef.value[member.ancestors[i]].nickname
    );
  }
  console.log("allMyMembersRef.value:", allMyMembersRef.value);
  //建立圓餅圖
  exampleSuffixs.value = [];
  for (let i = 0; i < member.ancestors.length; i++) {
    if (i < store.state.userInfo.depth) continue;
    exampleSuffixs.value.push(
      allMyMembersRef.value[member.ancestors[i]].urlsuffix
    );
  }
  exampleSuffixs.value.push(member.urlsuffix);
  getDoughnut(
    doughnutCanvas.value,
    [...ancestorsNicknames, member.nickname],
    commissionFormulaRef.value
  );
  if (suffix == store.state.userInfo.urlsuffix) {
    nickname.value = store.state.userInfo.nickname;
    currentSuffix.value = store.state.userInfo.urlsuffix;
    urlsuffix.value = store.state.userInfo.urlsuffix;
    role.value = store.state.userInfo.role;
    depth.value = store.state.userInfo.depth;
    instaId.value = store.state.userInfo.instaId;
    lineId.value = store.state.userInfo.lineid;
    kolName.value = store.state.userInfo.nickname;
    phoneNumber.value = store.state.userInfo.phonenumber;
  } else {
    let member = store.state.downlines[suffix];
    console.log("memeber", member);
    nickname.value = member.nickname;
    currentSuffix.value = member.urlsuffix;

    phoneNumber.value = member.phoneNumber;
    urlsuffix.value = member.urlsuffix;
    instaId.value = member.instaId;
    kolName.value = member.nickname;
    lineId.value = member.lineId;
    depth.value = member.depth;
    role.value = member.role;
  }
  if (store.state.userInfo.urlsuffix != currentSuffix.value) {
    let parentSuffix = allMyMembersRef.value[currentSuffix.value].parent;
    maxCommissionRef.value =
      allMyMembersRef.value[parentSuffix].commissionPercentage * 100;
    minCommissionRef.value =
      Object.values(store.state.downlines).filter(
        (m: any) => m.parent == currentSuffix.value
      ).length == 0
        ? 0
        : Math.max(
            ...Object.values(store.state.downlines)
              .filter((m: any) => m.parent == currentSuffix.value)
              .map((m: any) => m.commissionPercentage)
          ) * 100;
  }
}
</script>

<template>
  <div class="container mx-auto">
    <div class="py-3">
      <h1 class="text-3xl font-semibold">會員資訊</h1>
    </div>

    <div
      class="flex-col lg:flex-row flex w-full gap-16 justify-center px-2 lg:px-0"
    >
      <KolListComponentVue class="mx-auto" />

      <div
        class="mx-auto border-2 border-gray-400 rounded-md w-full max-w-[500px] lg:max-w-[400px] p-3 h-fit md:h-[600px]"
      >
        <div class="py-2">
          <label for="email" class="block text-sm font-medium text-gray-700"
            >綽號</label
          >

          <div class="mt-1">
            <input
              v-model="nickname"
              type="text"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div
          v-if="currentSuffix != store.state.userInfo.urlsuffix"
          class="py-3 mt-3"
        >
          <div class="font-bold text-xl">分成</div>
          <hr class="py-1" />
          <div class="max-w-[500px]">
            <label class="block text-sm font-medium text-gray-700"
              >會員分成:
              {{
                currentSuffix != ""
                  ? allMyMembersRef[currentSuffix].commissionPercentage * 100
                  : ""
              }}%</label
            >
            <label class="block text-sm font-medium text-gray-700"
              >會員分成設定上限: {{ maxCommissionRef }}%</label
            >
            <label class="block text-sm font-medium text-gray-700"
              >會員分成設定下限: {{ minCommissionRef }}%</label
            >

            <div class="flex gap-2 mt-5">
              <input
                ref="commissionPercentageRef"
                type="number"
                class="w-full block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @change="onCommissionPercentageChange"
              />
            </div>
          </div>
          <div
            class="flex gap-4 mt-5 justify-center"
            v-if="currentSuffix != ''"
          >
            <div>
              <button
                type="button"
                @click="onSubmit"
                class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                修改
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full p-3 h-fit md:h-[600px]">
        <div v-show="currentSuffix != ''">
          <div>當產品賣出後，該會員所有上線的抽成比例：</div>
          <br />
          <div class="w-full mx-auto">
            <canvas ref="doughnutCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格資訊 -->
    <div class="mt-16">
      <div class="mt-8 flex flex-col px-2">
        <div class="-my-2 overflow-x-auto">
          <div class="inline-block min-w-full py-2 align-middle">
            <div
              class="overflow-hidden shadow ring-1 ring-red-400 ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      姓名
                    </th>

                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      身分
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      深度
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      網址後綴
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ kolName }}
                    </td>

                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ role }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ depth }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ urlsuffix }}
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
