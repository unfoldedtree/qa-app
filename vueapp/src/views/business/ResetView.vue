<template>
  <div v-if="$route?.meta?.description"> {{$route?.meta?.description}} </div>
  <div class="alert bg-primary shadow-lg" :class="{ 'mt-4': $route?.meta?.description }" v-if="processing">
    <div class="text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Resetting business back to CT Only.</span>
    </div>
  </div>
  <div class="flex items-start gap-4 w-full justify-between flex-row">
    <ResetForm
        :businessResp="businessResp"
        :processing="processing"
        :allowReset="allowReset"
        @getBusiness="getBusiness"
        @resetBusiness="resetBusiness"
        @clearBusinessResp="clearBusinessResp"
    />
    <div class="md:container md:w-50 md:mx-auto mt-7">
      <div class="mockup-code">
        <pre class="px-5"><code>{{ businessResp }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, ref} from "vue";
import axios from "axios";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
import ResetForm from "@/components/business/ResetForm.vue";

const businessResp = ref({});
const allowReset = ref(true);
const processing = ref(false);

async function getBusiness(businessId: string): Promise<void> {
  const resp = await axios.get(`/exchange/v1/businesses/${businessId}`, {
    headers: {
      'Authorization': localStorage.getItem("token"),
      'Content-Type': 'application/json'
    }
  })

  businessResp.value = resp.data?.body;
}

async function resetBusiness(businessId: string): Promise<void> {
  try {
    processing.value = true;

    await axios.put(`/exchange/v1/businesses/${businessId}`,{
      isSelfServe: false
    }, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      }
    })

    await axios.put(`/exchange/v1/businesses/${businessId}/context`,{
      serviceGrants: [
        'CT'
      ]
    }, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      }
    })

    await getBusiness(businessId);

    createNotification({ message: 'Business reset successfully', type: "success" });
    allowReset.value = false;
  } catch (e: any) {
    createNotification({ message: 'Error resetting business!', type: "error" });
  } finally {
    processing.value = false;
  }
}

function clearBusinessResp(): void {
  allowReset.value = true;
  businessResp.value = {};
}
</script>

<style scoped>

</style>