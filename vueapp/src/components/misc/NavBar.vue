<template>
  <div class="navbar bg-base-100">
    <div class="navbar-start">
      <label for="my-drawer-2" tabindex="0" class="btn btn-ghost btn-circle drawer-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
      </label>
    </div>
    <div class="navbar-center">
      <a class="btn btn-ghost normal-case text-xl" @click="router.push({ name: 'dashboard' })">Util</a>
    </div>
    <div class="navbar-end">
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle">
          <div class="w-10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </div>
        </label>
        <ul tabindex="0" class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <span>
              Role:
              <span class="badge badge-xs badge-primary p-2 ml-auto">{{ mapRoleLevel() }} - {{ roleLevel }}</span>
            </span>
          </li>
          <li>
            <span>
              Token TTL:
              <span class="badge badge-xs badge-primary p-2 ml-auto">{{ tokenTTL.toLocaleString() }}</span>
            </span>
          </li>
          <hr />
          <li @click="logout">
            <a>Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import {computed, onUnmounted, ref, watch} from "vue";
import axios from "axios";

function logout(): void {
  localStorage.clear();
  router.push({
    name: "login"
  })
}

const cachedToken = ref(localStorage.getItem("token"));
const refreshToken = ref(localStorage.getItem("refreshToken"));
const now = ref(Math.ceil(Date.now() / 1000));
let handle: number;

const tokenTTL = computed(() => {
  return Number(parseJwt(cachedToken.value as string).exp) - now.value;
})

const roleLevel = computed(() => {
  return Number(parseJwt(cachedToken.value as string).role)
})

watch(tokenTTL, async (newValue, oldValue) => {
  const apiKey = localStorage.getItem("apiKey");

  if (!apiKey) {
    logout();
    return;
  }

  const refreshTokenExp = parseJwt(refreshToken.value as string)?.exp;
  if (refreshTokenExp - now.value > 0) {
    if (newValue < 10) {
      console.log("Refreshing Token");
      const resp = await axios.post('/v1/auth/refresh', null, {
        headers: {
          'X-API-KEY': apiKey,
          'X-REFRESH-TOKEN': refreshToken.value,
          'X-SERVICE': 'auth'
        }
      })

      if (resp.data) {
        console.log("Token Refreshed: ", resp.data)
        localStorage.setItem('token', resp.data.token);
        localStorage.setItem('refreshToken', resp.data.refresh_token);
        cachedToken.value = resp.data.token;
        refreshToken.value = resp.data.refresh_token;
      }
    }
  } else {
    logout();
  }

})

function update(): void {
  now.value = Math.ceil(Date.now() / 1000)
  handle = requestAnimationFrame(update)
}

update();

function parseJwt (token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function mapRoleLevel(): string {
  switch (roleLevel.value) {
    case 0:
      return 'Default';
    case 5:
      return 'Normal';
    case 10:
      return 'Developer';
    case 15:
      return 'Admin';
    case 20:
      return 'Super';
    default:
      return 'Unknown';
  }
}

onUnmounted(() => {
  cancelAnimationFrame(handle)
})
</script>

<style scoped>

</style>