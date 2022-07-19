<script setup lang="ts">
import { onMounted, ref, watch, inject, Ref } from "vue";
import { useStore } from "vuex";
import _ from "lodash";

const store = useStore();
const storeStateRef = ref();
storeStateRef.value = store.state;
const currentChildren: any = ref([]);
const currentSelectedParent = ref("");
const currentSelectedAncestors: any = ref([]);
const currentSelectMember = inject("currentSelectMember") as Ref<string>;
const onDownlineChangeClick = inject("onDownlineChangeClick") as Function;

//watch currentSelectedParent
watch(currentSelectedParent, (newValue) => {
  currentChildren.value = [];
  currentSelectedAncestors.value = [];
  storeStateRef.value = store.state;
  console.log(storeStateRef.value.downlines);

  if (newValue == store.state.userInfo.urlsuffix) {
    currentSelectedAncestors.value = [store.state.userInfo.urlsuffix];
  } else {
    // eslint-disable-next-line no-prototype-builtins
    if (storeStateRef.value.downlines.hasOwnProperty(newValue)) {
      let temp = storeStateRef.value.downlines[newValue].ancestors;
      currentSelectedAncestors.value = temp;
    }
  }
  Object.values(storeStateRef.value.downlines).forEach((downline: any) => {
    if (downline.parent == newValue) {
      currentChildren.value.push(downline);
    }
  });
});

onMounted(() => {
  console.log("storeStateRef.value:", storeStateRef.value);
  currentSelectedParent.value = store.state.userInfo.urlsuffix;
});

function onSelected(urlsuffix: string) {
  currentSelectedParent.value = urlsuffix;
}
</script>

<template>
  <div class="max-w-[500px] w-full text-sm h-fit md:h-[600px]">
    <div class="border-2 border-gray-400 rounded-md w-full mx-auto h-full">
      <div class="flex overflow-auto py-5 px-1">
        <template v-if="currentSelectedAncestors.length > 0">
          <div class="flex">
            <div
              @click="
                () => {
                  onSelected(ancestor);
                  currentSelectMember = ancestor;
                  onDownlineChangeClick();
                }
              "
              v-for="(ancestor, i) in currentSelectedAncestors"
              :key="i"
              class="flex"
            >
              <div v-if="ancestor == 'ADMIN_URL'"></div>
              <div class="flex" f v-else>
                <div
                  class="whitespace-nowrap"
                  v-if="ancestor == store.state.userInfo.urlsuffix"
                >
                  <div>
                    {{ store.state.userInfo.nickname }}
                  </div>
                  <div>({{ store.state.userInfo.urlsuffix }})</div>
                </div>
                <div class="whitespace-nowrap" v-else>
                  <template v-if="store.state.downlines[ancestor]">
                    {{ store.state.downlines[ancestor].nickname }}
                    <br />
                    ({{ store.state.downlines[ancestor].urlsuffix }})
                  </template>
                </div>
                <div>&nbsp;>&nbsp;</div>
              </div>
            </div>
            <template
              v-if="currentSelectedParent != store.state.userInfo.urlsuffix"
            >
              <div class="whitespace-nowrap">
                {{ store.state.downlines[currentSelectedParent].nickname }}
                <br />
                <div>
                  ({{ store.state.downlines[currentSelectedParent].urlsuffix }})
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
      <div
        class="border-t-2 border-t-gray-400 h-[400px] overflow-auto"
        v-if="currentChildren.length > 0"
      >
        <div
          class="px-1 py-1 bg-gray-200 border-b-2 border-gray-100"
          v-for="(children, k) in currentChildren"
          :key="k"
          @click="
            () => {
              onSelected(children.urlsuffix);
              currentSelectMember = children.urlsuffix;
              onDownlineChangeClick();
            }
          "
        >
          {{ store.state.downlines[children.urlsuffix].nickname }}
          <br />
          ({{ store.state.downlines[children.urlsuffix].urlsuffix }})
        </div>
      </div>
      <div class="border-t-2 border-t-gray-400 min-h-[400px]" v-else>
        沒有下線
      </div>
    </div>
  </div>
</template>
