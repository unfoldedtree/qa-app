<template>
  <div class="drawer-side">
    <label for="my-drawer-2" class="drawer-overlay"></label>
    <ul class="menu p-4 w-80 bg-base-100 text-base-content">
      <li tabindex="0">
        <a>Organization</a>
        <ul class="p-2 bg-base-100 shadow-2xl">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('organization_list') }" @click="$router.push({ name: 'organization_list'})">
              <span>Organization List</span>
              <div class="ml-2 badge badge-neutral">Support</div>
            </a>
          </li>
        </ul>
      </li>
      <li tabindex="0">
        <a>Business</a>
        <ul class="p-2 bg-base-100 shadow-2xl">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('business_list') }" @click="$router.push({ name: 'business_list'})">
              <span>Business List</span>
            </a>
          </li>
        </ul>
      </li>
      <li tabindex="0">
        <a>Fast Track</a>
        <ul class="p-2 bg-base-100 shadow-2xl">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('fast_track_details') }" @click="$router.push({ name: 'fast_track_details'})">
              <span>Fast Track Details</span>
            </a>
          </li>
        </ul>
      </li>
      <li tabindex="0">
        <a>Phone Numbers</a>
        <ul class="p-2 bg-base-100 shadow-2xl">
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('phone_numbers_verify') }" @click="$router.push({ name: 'phone_numbers_verify'})">
              <span>Verify Phone Numbers</span>
            </a>
          </li>
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('phone_numbers_generate') }" @click="$router.push({ name: 'phone_numbers_generate'})">
              <span>Phone Number Generator</span>
            </a>
          </li>
          <li>
            <a :class="{ 'bg-base-200': isActiveRoute('phone_numbers_details') }" @click="$router.push({ name: 'phone_numbers_details'})">
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

function isActiveRoute(checkRoute: string): boolean {
  return router.currentRoute.value.name === checkRoute;
}
</script>

<style scoped>

</style>