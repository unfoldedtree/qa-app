<template>
  <div class="drawer-side">
    <label for="my-drawer-2" class="drawer-overlay"></label>
    <ul class="menu p-4 w-80 bg-base-100 text-base-content">
      <li
          tabindex="0"
          v-for="(category, categoryIndex) in filteredSideBarRoutes"
          :key="categoryIndex"
      >
        <a>{{ category.label }}</a>
        <ul
            class="p-2 bg-base-100 shadow-2xl"
            v-show="sideBarOpen"
        >
          <li
              v-for="(route, routeIndex) in category.routes"
              :key="routeIndex"
          >
            <a
                :class="{ 'bg-base-200': isActiveRoute(route.name) }"
                @click="goToRoute(route.name)"
            >
              <span>{{ route.label }}</span>
              <div
                  class="ml-2 badge badge-neutral"
                  v-if="route.role"
              >
                {{ mapRoleLevel(route.role) }}
              </div>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import {computed, ref} from "vue";

const props = defineProps({
  sideBarOpen: Boolean
});
const emit = defineEmits(["closeSideBar"]);

const cachedToken = ref(localStorage.getItem("token"));

const roleLevel = computed(() => {
  return Number(parseJwt(cachedToken.value as string).role)
})

const sideBarRoutes = [
  {
    label: "Organization",
    routes: [
      {
        label: "Organization List",
        name: "organization_list",
        role: 15
      }
    ]
  },
  {
    label: "Business",
    routes: [
      {
        label: "Business List",
        name: "business_list",
      }
    ]
  },
  {
    label: "Fast Track",
    routes: [
      {
        label: "Fast Track Details",
        name: "fast_track_details",
      }
    ]
  },
  {
    label: "Phone Numbers",
    routes: [
      {
        label: "Verify Phone Numbers",
        name: "phone_numbers_verify",
      },
      {
        label: "Phone Number Generator",
        name: "phone_numbers_generate",
      },
      {
        label: "Phone Number Details",
        name: "phone_numbers_details",
        role: 15
      }
    ]
  }
]

const filteredSideBarRoutes = computed(() => {
  const routes = sideBarRoutes.filter((category) => {
    return category.routes.some((route) => {
      return route.role ? roleLevel.value >= route.role : true;
    });
  });

  routes.filter((category) => {
    category.routes = category.routes.filter((route) => {
      return route.role ? roleLevel.value >= route.role : true;
    });
  });

  return routes;
});

function isActiveRoute(checkRoute: string): boolean {
  return router.currentRoute.value.name === checkRoute;
}

function goToRoute(route: string): void {
  emit("closeSideBar");
  router.push({ name: route });
}

function parseJwt (token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function mapRoleLevel(roleLevel: number): string {
  switch (roleLevel) {
    case 0:
      return 'Base';
    case 5:
      return 'Admin';
    case 10:
      return 'Developer';
    case 15:
      return 'Support';
    case 20:
      return 'Super';
    default:
      return 'Unknown';
  }
}
</script>

<style scoped>

</style>