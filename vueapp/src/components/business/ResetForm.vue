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
                        <span class="label-text">Business</span>
                        <span class="label-text-alt">(required)</span>
                      </label>
                      <input type="text" id="businessId" class="input input-bordered" placeholder="Enter business id here..." v-model="businessId" :disabled="processing">
                    </div>

                    <div class="form-control mt-6" v-if="!isBusinessRespEmpty">
                      <button class="btn btn-error" @click="resetBusiness" :disabled="processing || !businessId || !allowReset">Reset</button>
                    </div>

                    <div class="form-control mt-6" v-else>
                      <button class="btn btn-primary" @click="getBusiness" :disabled="processing || !businessId">Fetch</button>
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
import {computed, inject, ref} from "vue";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
const props = defineProps(['businessResp', 'processing', 'allowReset']);
const emit = defineEmits(['clearBusinessResp', 'resetBusiness', 'getBusiness']);
// const businessId = ref("c171c130-d440-4aac-bb92-97b21ea921cb");
const businessId = ref("b67cbe1e-88c4-48ec-a867-670473b2d7cf");

const isBusinessRespEmpty = computed(() => {
  return !props.businessResp || !Object.keys(props.businessResp).length;
});

async function getBusiness(): Promise<void> {
  if (!businessId.value) {
    return;
  }

  emit('getBusiness', businessId.value);
}

async function resetBusiness(): Promise<void> {
  if (!businessId.value) {
    return;
  }

  emit('resetBusiness', businessId.value);
}

function clearForm(): void {
  emit('clearBusinessResp');
  businessId.value = "";
}
</script>

<style scoped>

</style>