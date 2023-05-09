<template>
  <div class="drawer-side">
    <label for="my-drawer-2" class="drawer-overlay"></label>
    <ul class="menu p-4 w-80 bg-base-100 text-base-content">
      <li tabindex="0">
        <a>Organization</a>
        <ul class="p-2 bg-base-100 shadow-2xl" v-show="sideBarOpen">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('organization_list') }" @click="goToRoute('organization_list')">
              <span>Organization List</span>
              <div class="ml-2 badge badge-neutral">Support</div>
            </a>
          </li>
        </ul>
      </li>
      <li tabindex="0">
        <a>Business</a>
        <ul class="p-2 bg-base-100 shadow-2xl" v-show="sideBarOpen">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('business_list') }" @click="goToRoute('business_list')">
              <span>Business List</span>
            </a>
          </li>
        </ul>
      </li>
      <li tabindex="0">
        <a>Fast Track</a>
        <ul class="p-2 bg-base-100 shadow-2xl" v-show="sideBarOpen">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('fast_track_details') }" @click="goToRoute('fast_track_details')">
              <span>Fast Track Details</span>
            </a>
          </li>
        </ul>
      </li>
      <li tabindex="0">
        <a>Phone Numbers</a>
        <ul class="p-2 bg-base-100 shadow-2xl" v-show="sideBarOpen">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('phone_numbers_verify') }" @click="goToRoute('phone_numbers_verify')">
              <span>Verify Phone Numbers</span>
            </a>
          </li>
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('phone_numbers_generate') }" @click="goToRoute('phone_numbers_generate')">
              <span>Phone Number Generator</span>
            </a>
          </li>
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('phone_numbers_details') }" @click="goToRoute('phone_numbers_details')">
              <span>Phone Number Details</span>
              <div class="ml-2 badge badge-neutral">Support</div>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";

const props = defineProps({
  sideBarOpen: Boolean
});
const emit = defineEmits(["closeSideBar"]);

function isActiveRoute(checkRoute: string): boolean {
  return router.currentRoute.value.name === checkRoute;
}

function goToRoute(route: string): void {
  emit("closeSideBar");
  router.push({ name: route });
}
</script>

<style scoped>

</style>