<script setup lang="ts">
import { useStore } from "vuex";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/vue";
import { MenuIcon, XIcon, CogIcon } from "@heroicons/vue/outline";
import { useRoute, useRouter } from "vue-router";
import { Vue3Marquee } from "vue3-marquee";
import "vue3-marquee/dist/style.css";

// import Carousel from "./Carousel.vue";

const route = useRoute();
const router = useRouter();
const store = useStore();
var navigation: any;
switch (store.state.userInfo.role) {
  case "admin":
    navigation = [
      { name: "首頁", href: "/home" },
      { name: "管理者頁面", href: "/supervisorPage" },
      { name: "建立下線", href: "/createDownline" },
      { name: "商品調整頁", href: "/products" },
      { name: "訂單頁面", href: "/report" },
      { name: "驗證KOL", href: "/veriflyKol" },
      { name: "公告頁面", href: "/announcementPage" },
      { name: "跑馬燈管理頁面", href: "/carousel" },
      { name: "紅利管理頁面", href: "/commissionManagement" },
    ];
    break;
  case "sub":
    navigation = [
      { name: "首頁", href: "/home" },
      { name: "建立下線", href: "/createDownline" },
      { name: "訂單頁面", href: "/report" },
      { name: "驗證KOL", href: "/veriflyKol" },
      { name: "公告頁面", href: "/announcementPage" },
      { name: "跑馬燈管理頁面", href: "/carousel" },
      { name: "紅利管理頁面", href: "/commissionManagement" },
    ];
    break;
  case "kol":
    navigation = [
      { name: "首頁", href: "/home" },
      { name: "建立下線", href: "/createDownline" },
      { name: "調整下線", href: "/ConfigureDownline" },
      { name: "訂單頁面", href: "/report" },
      { name: "公告頁面", href: "/announcementPage" },
      { name: "商品頁面", href: "/productDownline" },
    ];

    break;

  default:
    break;
}

// const navigation =
//   store.state.userInfo.role == "admin"
//     ? [
//         // { name: "個人資訊", href: "/home" },
//         { name: "管理者頁面", href: "/supervisorPage" },
//         { name: "建立下線", href: "/createDownline" },
//         // { name: "調整下線", href: "/ConfigureDownline" },
//         { name: "商品調整頁", href: "/products" },
//         { name: "訂單頁面", href: "/report" },
//         { name: "驗證KOL", href: "/veriflyKol" },
//         { name: "公告頁面", href: "/announcementPage" },

//         { name: "跑馬燈管理頁面", href: "/carousel" },
//       ]
//     : [
//         // { name: "個人資訊", href: "/home" },
//         { name: "建立下線", href: "/createDownline" },
//         { name: "調整下線", href: "/ConfigureDownline" },
//         { name: "訂單頁面", href: "/report" },
//         { name: "公告頁面", href: "/announcementPage" },
//       ];

function signout() {
  router.push("/");
}

function showStore() {
  console.log("==== show store ====");
  console.log(store.state);
  console.log("==== show store end ====");
}
</script>
<template>
  <div class="bg-gray-800 text-gray-200 shadow-md">
    <div>
      <Vue3Marquee>
        <div class="flex gap-72">
          <div
            v-for="(carousel, index) in store.state.allCarousels"
            :key="index"
          >
            {{ carousel.msg }}
          </div>
        </div>
      </Vue3Marquee>
    </div>
    <Disclosure as="nav" class="bg-white" v-slot="{ open }">
      <!-- <Carousel /> -->
      <div class="px-2 mx-auto sm:px-6 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <div class="absolute inset-y-0 left-0 flex items-center lg:hidden">
            <!-- Mobile menu button-->
            <DisclosureButton
              class="inline-flex items-center justify-center p-2 text-[#244a69] rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span class="sr-only">Open main menu</span>
              <MenuIcon v-if="!open" class="block w-6 h-6" aria-hidden="true" />
              <XIcon v-else class="block w-6 h-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
          <div class="flex items-center justify-center flex-1 lg:items-stretch">
            <router-link to="/home">
              <div class="flex items-center flex-shrink-0">
                <img
                  class="block w-auto h-8 lg:hidden"
                  src="https://cdn.shopify.com/s/files/1/0567/7393/5146/files/0fb0db42c116c08666f42cebc91e4524_ee2e4e41-4068-465e-b618-e829553d8153.png?v=1652952172"
                  alt="Workflow"
                />
                <img
                  class="hidden w-auto h-8 lg:block"
                  src="https://cdn.shopify.com/s/files/1/0567/7393/5146/files/0fb0db42c116c08666f42cebc91e4524_ee2e4e41-4068-465e-b618-e829553d8153.png?v=1652952172"
                  alt="Workflow"
                />
              </div>
            </router-link>
            <div class="hidden lg:block lg:ml-6">
              <div class="flex space-x-4">
                <router-link
                  v-for="item in navigation"
                  :class="[
                    route.path == item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-[#244a69] hover:bg-gray-700 hover:text-white',
                  ]"
                  class="px-3 py-2 text-xs font-medium rounded-md"
                  :key="item.name"
                  :to="item.href"
                  >{{ item.name }}</router-link
                >
              </div>
            </div>
          </div>
          <div
            class="hidden px-4 py-2 text-white border border-white rounded-lg cursor-pointer"
            t
          >
            <router-link to="/customerService">聯絡客服</router-link>
          </div>
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0"
          >
            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton
                  class="flex text-sm text-[#244a69] focus:outline-none hover:text-opacity-75 bg-opacity-0 hover:bg-opacity-50 w-fit rounded-full active:bg-gray-400 transition-all bg-gray-300"
                >
                  <span class="sr-only">Open user menu</span>
                  <CogIcon class="w-6 h-6" aria-hidden="true" />
                </MenuButton>
              </div>

              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems
                  class="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="signout"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >登出</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="showStore"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700',
                      ]"
                      >DEBUG</a
                    >
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel class="lg:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <DisclosureButton
            v-for="item in navigation"
            :key="item.name"
            as="a"
            :href="item.href"
            :class="[
            (item as any).current
              ? 'bg-[#244a69] text-white'
              : 'text-[#244a69] hover:bg-gray-700 hover:text-white',
            'block px-3 py-2 rounded-md text-base font-medium',
          ]"
            :aria-current="(item as any).current ? 'page' : undefined"
            >{{ item.name }}</DisclosureButton
          >
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>
