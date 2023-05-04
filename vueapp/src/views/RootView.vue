<template>
  <main>
    <div class="bg-base-200">
      <div class="drawer">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <!-- Page content here -->
          <div class="flex flex-col items-center justify-start">
            <NavBar />
            <div class="md:container flex items-center justify-center flex-col px-5 py-5">
              <div class="pt-6 pb-2 text-[28px]">{{ pageTitle }}</div>
              <RouterView />
            </div>
          </div>
          <div class="flex flex-col items-center justify-center"></div>
        </div>

        <SidebarNav />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import NavBar from "@/components/misc/NavBar.vue";
import SidebarNav from "@/components/misc/SidebarNav.vue";
import { computed, inject } from "vue";
import router from "@/router";
import type {CreateNotification} from "@/plugins/notifications";

const pageTitle = computed(() => {
  return router?.currentRoute?.value?.meta?.title as string || "Default Page Title";
})

// const createNotification = inject("create-notification") as CreateNotification;
//
// createNotification({ message: "asdfasdf" });
</script>

<style lang="scss" scoped>

</style>
