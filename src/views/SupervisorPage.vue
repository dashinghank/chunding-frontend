<script setup lang="ts">
import { inject, onMounted, provide, ref, Ref } from "vue";
import { getDoughnut, destroyChart } from "../store/doughnut";
import _ from "lodash";
import axios from "axios";

import moment from "moment";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  where,
  query,
  addDoc,
} from "firebase/firestore";
import { useStore } from "vuex";
import ListComponent from "@/components/ListComponent.vue";
import MemberTreeView from "@/components/MemberTreeView.vue";

var db = getFirestore();
const store = useStore();
// ===== data refs =====
const treeDataRef = ref([]) as Ref<any[]>;
const currentSelectMember = ref() as Ref<string>;
const allMembersRef: Ref<any> = ref({}) as Ref<any>;

//==== element refs ====
const commissionPercentageRef = ref();
const currentSuffix: Ref<string> = ref("");

const isShowMask: Ref<boolean> = inject("isShowMask") as Ref<boolean>;
//分成公式, 詳細列出每家可分成的%數
const commissionFormulaRef: Ref<any[]> = ref([]);
const maxCommissionRef: Ref<number> = ref(0);
const minCommissionRef: Ref<number> = ref(0);

// ===== input refs =====
const subAccount = ref("");
const subPassword = ref("");
const subNickname = ref("");
const nickname = ref("");
const password = ref("");
const urlsuffix = ref("");
const commissionPercentage = ref(0);
const role = ref("");
const depth = ref(-1);
const instaId = ref("");
const lineId = ref("");
const kolName = ref("");
const phoneNumber = ref("");
// ===== canvas refs =====
const doughnutCanvas = ref();

// ===== example refs =====
const exampleSuffixs = ref();

provide("currentSelectMember", currentSelectMember);
provide("onDownlineChangeClick", onDownlineChangeClick);

onMounted(async () => {
  if (Object.values(allMembersRef.value).length == 0) {
    var allMemebersSnapshot: any = await getDocs(
      query(collection(db, "members"), where("verifiedStatus", "==", 1))
    );

    allMemebersSnapshot.forEach((member: any) => {
      allMembersRef.value[member.data().urlsuffix] = {
        id: member.id,
        ...member.data(),
      };
    });
  }

  //建立樹狀圖
  treeDataRef.value = createTree();
  console.log(treeDataRef.value);
});

function createTree() {
  let tempMemberNodes: any[] = [];

  Object.values(allMembersRef.value).forEach((member: any) => {
    tempMemberNodes.push({
      id: member.urlsuffix,
      text: member.urlsuffix,
      parentId: member.parent,
      level: member.depth,
      children: [],
    });
  });

  tempMemberNodes = _.sortBy(tempMemberNodes, "level");
  return list_to_tree(tempMemberNodes);
}

function list_to_tree(list: any) {
  var map: any = {},
    node,
    roots: any[] = [],
    i;

  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parentId !== "") {
      // if you have dangling branches check that map[node.parentId] exists
      console.log(node.parentId);
      list[map[node.parentId]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function onDownlineChangeClick() {
  clearAllInputs();
  destroyChart();
  onDownlineChange(currentSelectMember.value);
}

function onDownlineChange(suffix: string) {
  let member = allMembersRef.value[suffix];
  nickname.value = member.nickname;
  password.value = member.password;
  urlsuffix.value = member.urlsuffix;
  currentSuffix.value = member.urlsuffix;
  commissionPercentage.value = Math.floor(member.commissionPercentage * 100);
  role.value = member.role;
  depth.value = member.depth;
  instaId.value = member.instaId;
  lineId.value = member.lineid;
  kolName.value = member.kolname;
  phoneNumber.value = member.phonenumber;
  //計算分成公式
  commissionFormulaRef.value = [];
  for (let i in member.ancestors) {
    commissionFormulaRef.value.push(
      allMembersRef.value[member.ancestors[i]].commissionPercentage
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

  //建立圓餅圖
  let ancestorsNicknames = member.ancestors.map((ancestor: string) => {
    return allMembersRef.value[ancestor].nickname;
  });

  exampleSuffixs.value = member.ancestors.map((ancestor: string) => {
    return allMembersRef.value[ancestor].urlsuffix;
  });

  exampleSuffixs.value.push(member.urlsuffix);

  getDoughnut(
    doughnutCanvas.value,
    [...ancestorsNicknames, member.nickname],
    commissionFormulaRef.value
  );

  //取得目前會員可取得最大分成, 即自己父親的分成
  if (store.state.userInfo.urlsuffix != currentSuffix.value) {
    maxCommissionRef.value =
      allMembersRef.value[member.parent].commissionPercentage * 100;
  }

  //取得目前選擇下線給予下下線的最高分成
  minCommissionRef.value =
    Object.values(allMembersRef.value).filter(
      (m: any) => m.parent == currentSuffix.value
    ).length == 0
      ? 0
      : Math.max(
          ...Object.values(allMembersRef.value)
            .filter((m: any) => m.parent == currentSuffix.value)
            .map((m: any) => m.commissionPercentage)
        ) * 100;
}

async function onToggleMember(lockStatus: boolean) {
  try {
    isShowMask.value = true;

    let result = await axios.post(
      "https://shopify-api-nine.vercel.app/api/updateMember",
      {
        docId: `members/${allMembersRef.value[currentSuffix.value].id}`,
        isLocked: lockStatus,
      }
    );

    if (result.data.status == "000") {
      allMembersRef.value[currentSuffix.value].isLocked = lockStatus;
      alert("修改成功");
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
  allMembersRef.value[currentSuffix.value].nickname = nickname.value;
  allMembersRef.value[currentSuffix.value].password = password.value;
  allMembersRef.value[currentSuffix.value].commissionPercentage =
    commissionPercentage.value / 100;

  onDownlineChange(currentSuffix.value);
}

async function onSubmit() {
  console.log(commissionPercentage.value / 100);
  try {
    isShowMask.value = true;

    let result = await axios.post(
      "https://shopify-api-nine.vercel.app/api/updateMember",
      {
        docId: `members/${allMembersRef.value[currentSuffix.value].id}`,
        nickname: nickname.value,
        password: password.value,
        commissionPercentage: commissionPercentage.value / 100,
      }
    );

    if (result.data.status == "000") {
      allMembersRef.value[currentSuffix.value].nickname = nickname.value;
      allMembersRef.value[currentSuffix.value].password = password.value;
      allMembersRef.value[currentSuffix.value].commissionPercentage =
        commissionPercentage.value / 100;
      alert("修改成功");
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

  onDownlineChange(currentSuffix.value);
}

function clearAllInputs() {
  console.log("clearAllInputs");
  commissionPercentage.value = 0;
  phoneNumber.value = "";
  urlsuffix.value = "";
  nickname.value = "";
  password.value = "";
  instaId.value = "";
  kolName.value = "";
  lineId.value = "";
  role.value = "";
  commissionPercentageRef.value.value = "";
  depth.value = -1;
}

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

async function checkDuplicateAccount() {
  let tempQuery = query(
    collection(db, "members"),
    where("account", "==", subAccount.value)
  );
  let tempDocs = await getDocs(tempQuery);
  return tempDocs.docs.length > 0;
}

function hasEmptyInput() {
  if (subAccount.value == "") return true;
  if (subPassword.value == "") return true;
  if (subNickname.value == "") return true;
  return false;
}
async function createSubAccount() {
  isShowMask.value = true;
  if (await checkDuplicateAccount()) {
    alert("帳號重複");
    isShowMask.value = false;
    return;
  }

  if (hasEmptyInput()) {
    alert("請輸入完整資料");
    isShowMask.value = false;
    return;
  }

  let currentDatetime = moment().valueOf();
  let newDownline = {
    account: subAccount.value,
    password: subPassword.value,
    nickname: subNickname.value,
    commissionPercentage: parseFloat(
      (commissionPercentage.value / 100).toFixed(2)
    ),
    depth: store.state.userInfo.depth + 1,
    isLocked: false,
    // -1: 驗證失敗, 0: 未驗證, 1: 驗證成功, 2: 驗證中
    verifiedStatus: 1,
    kolname: "",
    lineid: "",
    phonenumber: "",
    lastLoginDatetime: currentDatetime,
    registerDatetime: currentDatetime,
    role: "sub",
    urlsuffix: subAccount.value,
    ancestors:
      store.state.userInfo.ancestors.length == 0
        ? [store.state.userInfo.urlsuffix]
        : [...store.state.userInfo.ancestors, store.state.userInfo.urlsuffix],
    parent: store.state.userInfo.urlsuffix,
  };

  try {
    await addDoc(collection(db, "members"), newDownline);
  } catch (e) {
    alert("新增失敗");
    isShowMask.value = false;
    return;
  }

  alert("新增成功");
  isShowMask.value = false;
  store.commit("setDownline", newDownline);
  // store.state.downlines[newDownline.urlsuffix] = newDownline;
}
</script>

<template>
  <div class="container mx-auto">
    <!-- 測試區 -->
    <!-- <div id="treeRoot" v-if="treeDataRef.length > 0">
      <MemberTreeView :data="treeDataRef[0]" />
    </div> -->

    <div class="py-3">
      <h1 class="text-3xl font-semibold">會員資訊</h1>
    </div>
    <div class="flex-col lg:flex-row flex w-full gap-16 justify-center">
      <ListComponent class="mx-auto" />
      <div
        class="mx-auto border-2 border-gray-400 rounded-md w-full max-w-[360px] p-3 h-fit md:h-[600px]"
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
        <div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >密碼</label
            >
            <div class="mt-1">
              <input
                v-model="password"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div class="py-3 mt-3">
          <div class="font-bold text-xl">分成</div>
          <hr class="py-1" />
          <div class="max-w-[500px]">
            <label class="block text-sm font-medium text-gray-700"
              >可給予最高分成: {{ maxCommissionRef }}%</label
            >
            <label class="block text-sm font-medium text-gray-700"
              >可給予最低分成: {{ minCommissionRef }}%</label
            >
            <label class="block text-sm font-medium text-gray-700"
              >上線目前給予此會員的產品分成:
              {{
                currentSuffix != ""
                  ? allMembersRef[currentSuffix].commissionPercentage * 100
                  : ""
              }}%</label
            >

            <div class="flex gap-2 mt-5">
              <input
                ref="commissionPercentageRef"
                type="number"
                class="w-full block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                @change="onCommissionPercentageChange"
              />
            </div>
            <label
              class="block text-sm font-medium text-red-600"
              v-if="currentSuffix != ''"
              >此會員給予下線最高產品分成: {{ minCommissionRef }} %</label
            >
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

            <div>
              <template v-if="!allMembersRef[currentSuffix].isLocked">
                <button
                  type="button"
                  @click="onToggleMember(true)"
                  class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  鎖定
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  @click="onToggleMember(false)"
                  class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  解鎖
                </button></template
              >
            </div>
          </div>
        </div>
      </div>
      <div class="w-full p-3 h-fit md:h-[600px]">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700"
          ></label>
          <div v-show="currentSuffix != ''">
            <div>當產品賣出後，該會員所有上線的抽成比例：</div>
            <br />
            <div class="w-full mx-auto">
              <canvas ref="doughnutCanvas"></canvas>
            </div>
            <!-- <div>範例:</div>
            <div>產品售價: 2000元 &nbsp;&nbsp; 產品最高分潤金額:1000元</div>
            <template v-for="(suffix, index) in exampleSuffixs" :key="index">
              <div class="grid w-64 grid-cols-2">
                <div>{{ allMembersRef[suffix].nickname }}:</div>
                <div>{{ commissionFormulaRef[index] * 1000 }}元</div>
              </div>
            </template> -->
          </div>
        </div>
      </div>
    </div>
    <!-- 表格資訊 -->
    <div class="mt-16">
      <div class="mt-8 flex flex-col">
        <div class="-my-2 overflow-x-auto">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
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
                      電話
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Line
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      IG
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
                      {{ phoneNumber }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ lineId }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ instaId }}
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

    <div class="py-3 mt-12">
      <h1 class="text-3xl font-semibold">新建子帳號</h1>
      <div class="mt-10">
        <div class="mx-auto w-fit sm:ml-0">
          <div class="max-w-[300px]">
            <label class="block text-sm font-medium text-gray-700">帳號</label>
            <div class="mt-1">
              <input
                v-model="subAccount"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="max-w-[300px]">
            <label class="block text-sm font-medium text-gray-700">密碼</label>
            <div class="mt-1">
              <input
                v-model="subPassword"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="max-w-[300px]">
            <label class="block text-sm font-medium text-gray-700">暱稱</label>
            <div class="mt-1">
              <input
                v-model="subNickname"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="mt-5">
            <button
              type="button"
              @click="createSubAccount"
              class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              建立
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
