<script setup lang="ts">
import { onMounted, ref, watch, inject, Ref } from "vue";
import { useStore } from "vuex";
import _ from "lodash";

const store = useStore();
const storeStateRef = ref();
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

  if (newValue == "ADMIN_URL") {
    currentSelectedAncestors.value = ["ADMIN_URL"];
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
  currentSelectedParent.value = "ADMIN_URL";
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
              <div v-if="ancestor == 'ADMIN_URL'">
                {{ ancestor }}
              </div>
              <div v-if="ancestor != 'ADMIN_URL'" class="whitespace-nowrap">
                {{ store.state.downlines[ancestor].nickname }}
                <br />
                ({{ store.state.downlines[ancestor].urlsuffix }})
              </div>

              <div>&nbsp;>&nbsp;</div>
            </div>
            <template v-if="currentSelectedParent != 'ADMIN_URL'">
              <div class="whitespace-nowrap">
                {{ store.state.downlines[currentSelectedParent].nickname }}
                <br />
                ({{ store.state.downlines[currentSelectedParent].urlsuffix }})
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
        <!-- <div
          v-for="(children, k) in currentChildren"
          :key="k"
          @click="onSelected(children.urlsuffix)"
        >
          {{ children.urlsuffix }}
        </div> -->
      </div>
      <div class="border-t-2 border-t-gray-400 min-h-[400px]" v-else>
        沒有下線
      </div>
    </div>
  </div>
</template>
