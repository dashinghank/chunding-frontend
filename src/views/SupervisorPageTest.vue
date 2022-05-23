<script setup lang="ts">
import { inject, onMounted, ref, Ref } from "vue";
import { getDoughnut, destroyChart } from "../store/doughnut";
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

var db = getFirestore();
const store = useStore();
// ===== data refs =====
const allMembersRef: Ref<any> = ref({});

const currentSuffix: Ref<string> = ref("");
const currentDownlinesRef = ref<any[]>([]);

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
const downlineSelectRef = ref();
const instaId = ref("");
const lineId = ref("");
const kolName = ref("");
const phoneNumber = ref("");
// ===== canvas refs =====
const doughnutCanvas = ref();

// ===== example refs =====
const exampleSuffixs = ref();

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
});

//做到選擇上線後還要設定下線的人選
function onUplineChange(e: any) {
  currentDownlinesRef.value = [];
  downlineSelectRef.value.value = "none";
  destroyChart();
  Object.values(allMembersRef.value).forEach((member: any) => {
    if (member.parent == e.target.value) {
      currentDownlinesRef.value.push(member);
    }
  });

  //把自己也當成下線
  currentDownlinesRef.value.push(allMembersRef.value[e.target.value]);
  clearAllInputs();
}

function onDownlineChangeClick(e: any) {
  destroyChart();
  onDownlineChange(e.target.value);
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
    await updateDoc(
      doc(db, `members/${allMembersRef.value[currentSuffix.value].id}`),
      {
        isLocked: lockStatus,
      }
    );
    allMembersRef.value[currentSuffix.value].isLocked = lockStatus;
  } catch (e: any) {
    alert("修改失敗:" + e.message);
    isShowMask.value = false;

    return;
  }
  isShowMask.value = false;

  alert("修改成功");
  destroyChart();
  allMembersRef.value[currentSuffix.value].nickname = nickname.value;
  allMembersRef.value[currentSuffix.value].password = password.value;
  allMembersRef.value[currentSuffix.value].commissionPercentage =
    commissionPercentage.value / 100;

  onDownlineChange(currentSuffix.value);
}

async function onSubmit() {
  try {
    isShowMask.value = true;
    await updateDoc(
      doc(db, `members/${allMembersRef.value[currentSuffix.value].id}`),
      {
        nickname: nickname.value,
        password: password.value,
        commissionPercentage: commissionPercentage.value / 100,
      }
    );
  } catch (e: any) {
    alert("修改失敗:" + e.message);
    isShowMask.value = false;

    return;
  }
  isShowMask.value = false;

  alert("修改成功");
  destroyChart();
  allMembersRef.value[currentSuffix.value].nickname = nickname.value;
  allMembersRef.value[currentSuffix.value].password = password.value;
  allMembersRef.value[currentSuffix.value].commissionPercentage =
    commissionPercentage.value / 100;

  onDownlineChange(currentSuffix.value);
}

function clearAllInputs() {
  nickname.value = "";
  password.value = "";
  urlsuffix.value = "";
  commissionPercentage.value = 0;
  role.value = "";
  depth.value = -1;
}

function onCommissionPercentageChange(e: any) {
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
  <div class="my-[12.5vh] container mx-auto">
    <div class="w-1/4">
      <label for="location" class="block text-sm font-medium text-gray-700"
        >選擇上線</label
      >
      <select
        @change="onUplineChange"
        class="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option disabled selected hidden value="none">尚未選擇</option>
        <template v-for="(member, key, index) in allMembersRef" :key="index">
          <option :value="member.urlsuffix">
            {{ member.nickname }}
          </option>
        </template>
      </select>
    </div>
    <div class="w-1/4 mt-5" v-show="currentDownlinesRef.length > 0">
      <label for="location" class="block text-sm font-medium text-gray-700"
        >選擇下線 (或自己)</label
      >
      <select
        class="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        @change="onDownlineChangeClick"
        ref="downlineSelectRef"
      >
        <option disabled selected hidden value="none">尚未選擇</option>
        <template
          v-for="(member, key, index) in currentDownlinesRef"
          :key="index"
        >
          <option :value="member.urlsuffix">
            {{ member.nickname }}
          </option>
        </template>
      </select>
    </div>
    <div class="grid grid-cols-2">
      <div>
        <!-- 第一列 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
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
          </div>
        </div>
        <!-- 第二列 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
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
        </div>
        <!-- 第三列 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >網址後綴</label
              >
              <div class="mt-1">
                <input
                  v-model="urlsuffix"
                  disabled
                  type="text"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 第四列 -->
        <div class="mt-5">
          <div>
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

              <div class="flex gap-2 mt-1">
                <input
                  type="number"
                  class="w-[200px] block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  @change="onCommissionPercentageChange"
                />
              </div>
              <label
                class="block text-sm font-medium text-red-600"
                v-if="currentSuffix != ''"
                >此會員給予下線最高產品分成: {{ minCommissionRef }} %</label
              >
            </div>
          </div>
        </div>
      </div>
      <div>
        <!-- 第一列 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >身分</label
              >
              <div class="mt-1">
                <input
                  type="text"
                  disabled
                  v-model="role"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 第二列 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >深度</label
              >
              <div class="mt-1">
                <input
                  v-if="depth == -1"
                  type="text"
                  disabled
                  value=""
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <input
                  v-else
                  type="text"
                  disabled
                  v-model="depth"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- instaId -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Instagram ID</label
              >
              <div class="mt-1">
                <input
                  type="text"
                  disabled
                  v-model="instaId"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- lineId -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Line ID</label
              >
              <div class="mt-1">
                <input
                  type="text"
                  disabled
                  v-model="lineId"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 姓名 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >KOL 姓名</label
              >
              <div class="mt-1">
                <input
                  type="text"
                  disabled
                  v-model="kolName"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 電話 -->
        <div class="mt-5">
          <div>
            <div class="max-w-[300px]">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >KOL 電話</label
              >
              <div class="mt-1">
                <input
                  type="text"
                  disabled
                  v-model="phoneNumber"
                  class="block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 第三列 -->
        <div class="mt-5">
          <div>
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700"
              ></label>
              <div v-show="currentSuffix != ''">
                <div>當產品賣出後，該會員所有上線的抽成比例：</div>
                <div class="max-w-[300px]">
                  <canvas ref="doughnutCanvas"></canvas>
                </div>
                <div>範例:</div>
                <div>產品售價: 2000元 &nbsp;&nbsp; 產品最高分潤金額:1000元</div>
                <template
                  v-for="(suffix, index) in exampleSuffixs"
                  :key="index"
                >
                  <div class="grid w-64 grid-cols-2">
                    <div>{{ allMembersRef[suffix].nickname }}:</div>
                    <div>{{ commissionFormulaRef[index] * 1000 }}元</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-5 flex gap-4" v-if="currentSuffix != ''">
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
    <div class="mt-10">
      <div>新建子帳號</div>
      <div>
        <div>帳號:<input type="text" v-model="subAccount" /></div>
        <div class="mt-4">密碼:<input type="text" v-model="subPassword" /></div>
        <div class="mt-4">暱稱:<input type="text" v-model="subNickname" /></div>
      </div>
      <div><button @click="createSubAccount">建立</button></div>
    </div>
  </div>
</template>
