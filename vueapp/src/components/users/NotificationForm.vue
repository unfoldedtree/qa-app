<template>
  <div class="md:container md:w-50 md:mx-auto bg-base-200">
    <div class="flex flex-col justify-between">
      <div class="container mx-auto">
        <div class="mt-7">
          <div class="text-center">
            <div class="max-w-100">
              <div class="mx-auto my-7">
                <div class="card flex-shrink-0 w-full mx-auto shadow-2xl bg-base-100">
                  <div class="card-body">
                    <div class="card-title">
                      <span>Details</span>
                      <button class="ml-auto btn btn-link" :disabled="processing" @click="clearForm">Clear</button>
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Reseller</span>
                        <span class="label-text-alt">(required)</span>
                      </label>
                      <input type="text" id="resellerId" class="input input-bordered" placeholder="Enter reseller id here..." v-model="resellerId" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Business</span>
                        <span class="label-text-alt"></span>
                      </label>
                      <input type="text" id="businessId" class="input input-bordered" placeholder="Enter business id here..." v-model="businessId" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Title</span>
                        <span class="label-text-alt"></span>
                      </label>
                      <input type="text" id="notificationTitle" class="input input-bordered" placeholder="Enter notification title here..." v-model="notificationTitle" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Body</span>
                        <span class="label-text-alt">(required)</span>
                      </label>
                      <input type="text" id="notificationBody" class="input input-bordered" placeholder="Enter notification body here..." v-model="notificationBody" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Roles</span>
                        <span class="label-text-alt">(required)</span>
                      </label>
                      <input type="text" id="notificationRoles" class="input input-bordered" placeholder="Affected roles..." :value="formatTargetRoles(targetRoles)" readonly>
                      <input type="range" :min="0" :max="roles.size" class="range mt-5" :step="1" v-model="rangeIndex" />
                    </div>
                    <div class="form-control mt-6">
                      <button class="btn btn-primary" @click="listUsers" :disabled="processing || !notificationBody">List Users</button>
                    </div>
                    <div class="form-control mt-6">
                      <button class="btn btn-primary" @click="sendIt" :disabled="processing || !users.size || !notificationBody">Send Notification</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref, watch} from "vue";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
const props = defineProps(['users', 'roles', 'processing']);
const emit = defineEmits(['clearUsers', 'fetchUsersList', 'filterUsersByRole', 'setTargetRoleIds', 'sendNotificationToUsers']);
// 3e2597b6-0f66-4b91-b1be-87eb4636959f Agent
// 5835a589-1f83-4e94-847d-753cab4d9228 Reseller
const resellerId = ref("");
const businessId = ref("");
const notificationTitle = ref("Test Notification");
const notificationBody = ref("This is a test notification.");
const notificationRole = ref("");
const rangeIndex = ref(0);

const targetRoles = computed(() => {
  const validRoles = [ ...props.roles.entries() ]
  const roleNames = [] as string[];
  const roleIds = [] as string[];

  for (let i = 0; i < rangeIndex.value; i++) {
    roleIds.push(validRoles[i][0]);
    roleNames.push(validRoles[i][1]);
  }

  emit('setTargetRoleIds', roleIds);
  return roleNames;
})

watch(rangeIndex, () => {
  emit('filterUsersByRole', targetRoles.value);
})

function formatTargetRoles(roles: string[]): string {
  return roles.join(', ');
}

async function listUsers(): Promise<void> {
  if (!notificationBody.value) {
    return;
  }

  emit('fetchUsersList', resellerId.value, businessId.value);
}

async function sendIt(): Promise<void> {
  if (!notificationBody.value) {
    return;
  }

  emit('sendNotificationToUsers', resellerId.value, businessId.value, notificationTitle.value, notificationBody.value);
}

function clearForm(): void {
  emit('clearUsers');
  resellerId.value = "";
  businessId.value = "";
  notificationTitle.value = "";
  notificationBody.value = "";
}
</script>

<style scoped>

</style>