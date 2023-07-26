<template>
  <div v-if="$route?.meta?.description"> {{$route?.meta?.description}} </div>
  <div class="alert bg-primary shadow-lg" :class="{ 'mt-4': $route?.meta?.description }" v-if="processing">
    <div class="text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Loading...</span>
    </div>
  </div>
  <div class="flex items-start gap-4 w-full justify-between flex-row">
    <NotificationForm
      :users="users"
      :roles="userRoles"
      :processing="processing"
      @fetchUsersList="fetchUsers"
      @clearUsers="clearUsers"
      @filterUsersByRole="filterUsersByRole"
      @setTargetRoleIds="setTargetRoleIds"
      @sendNotificationToUsers="sendNotificationToUsers"
    />
    <NotifcationUserList :users="filteredUsers" :roles="userRoles" />
  </div>
</template>

<script setup lang="ts">
import NotificationForm from "@/components/users/NotificationForm.vue";
import {inject, ref} from "vue";
import axios from "axios";
import NotifcationUserList from "@/components/users/NotifcationUserList.vue";
import type {CreateNotification} from "@/plugins/notifications";

const users = ref(new Map<string, string>());
const filteredUsers = ref(new Map<string, string>());
const userRoles = ref(new Map<string, string>());
const targetRoleIds = ref([] as string[]);
const processing = ref(false);
const validRoleNames = ref(["portalUser", "businessAdmin", "organizationAdmin", "resellerAgentAdmin"]);

const createNotification = inject("create-notification") as CreateNotification;

function setTargetRoleIds(roles: string[]): void {
  targetRoleIds.value = roles;
}

function filterUsersByRole(): void {
  if (targetRoleIds.value.length) {
    const matches = new Map<string, string>();
    users.value.forEach((value, key) => {
      if (targetRoleIds.value.includes(value)) {
        matches.set(key, value);
      }
    });
    filteredUsers.value = matches;
  } else {
    filteredUsers.value = users.value;
  }
}

async function fetchRoles(): Promise<void> {
  // resellerAgentAdmin : 99f45ea6b93211edafa10242ac120002
  // organizationAdmin : d4026d512adc4d0faa9ae6e59cd5b773
  // businessAdmin : 344a34a0977d45adab8d93203870da77
  // portalUser : 84fa4f1cd58b4ccdbdf67082e41c8132

  userRoles.value.set("99f45ea6b93211edafa10242ac120002", "resellerAgentAdmin");
  userRoles.value.set("d4026d512adc4d0faa9ae6e59cd5b773", "organizationAdmin");
  userRoles.value.set("344a34a0977d45adab8d93203870da77", "businessAdmin");
  userRoles.value.set("84fa4f1cd58b4ccdbdf67082e41c8132", "portalUser");

  // processing.value = true;
  // try {
  //   const response = await axios.get("/support/userRoles");
  //   const respRoles = response.data;
  //
  //   console.log(respRoles)
  //
  //   const rolesMap = new Map<string, string>();
  //   respRoles.forEach((it: any) => {
  //
  //     if (validRoleNames.value.includes(it.roleName)) {
  //       rolesMap.set(it.roleId, it.roleName);
  //     }
  //   })
  //
  //   userRoles.value = rolesMap;
  // } catch (e) {
  //   console.error(e);
  // } finally {
  //   processing.value = false;
  // }
}

fetchRoles();

async function fetchUsers(resellerId: string, businessId: string): Promise<void> {
  processing.value = true;
  try {
    const response = await axios.get("/support/users", {
      params: {
        resellerId: resellerId || null,
        businessId: businessId || null,
      },
    });

    const respUsers = response.data;
    console.log(respUsers)

    const userMap = new Map<string, string>();
    respUsers.forEach((it: any) => {
      userMap.set(it.email, it.userRoleId);
    })

    users.value = userMap;
    filterUsersByRole();
  } catch (e) {
    console.error(e);
  } finally {
    processing.value = false;
  }
}

async function sendNotificationToUsers(resellerId: string, businessId: string, title: string, body: string): Promise<void> {
  const userPool = [ ...filteredUsers.value.keys() ];

  const resp = await axios.post("/support/users/notifications", {
    userEmails: userPool,
    resellerId: resellerId || null,
    businessId: businessId || null,
    title: title,
    body: body,
  });

  createNotification({ message: resp?.data })
}

function clearUsers() {
  users.value.clear();
}
</script>

<style lang="scss" scoped>
</style>