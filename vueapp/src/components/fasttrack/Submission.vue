<template>
  <div class="my-2 p-4 rounded border-2 border-base-content">
    <div>Display Names: {{ submission.displayNames.join(',') }}</div>
    <div>Submission Id: {{ submission.submissionId }}</div>
    <div>Total Segments: {{ submission.segmentsTotal.toLocaleString() }}</div>
    <div>Created At: {{ `${(new Date(submission.createdAt * 1000)).toLocaleDateString()} ${(new Date(submission.createdAt * 1000)).toLocaleTimeString()}` }}</div>
    <div class="flex items-center relative">
      <div class="flex items-center">Status: <span :class="`ml-2 badge badge-xs p-2 ${getSubmissionStatusClass(submission.status)}`">{{ submission.status }}</span></div>
      <div class="btn btn-link absolute right-[0px]" @click="showRejections = !showRejections">{{ showRejections ? 'Hide' : 'View' }} Rejections</div>
    </div>
    <div v-if="showRejections && submissionRejections.length" class="mt-4 max-h-[250px] overflow-auto">
      <table class="table table-compact w-full">
        <thead>
        <tr>
          <th></th>
          <th>Program Id</th>
          <th>Display Name</th>
          <th>Phone Number</th>
          <th>CPC</th>
          <th>Rejection Reason</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(rejection, index) in submissionRejections" :key="index">
          <th>{{ index }}</th>
          <td>{{ rejection?.programId || 'N/A' }}</td>
          <td>{{ rejection?.displayName || 'N/A' }}</td>
          <td>{{ rejection?.phoneNumber || 'N/A' }}</td>
          <td>{{ rejection?.rejection?.callPurposeCode || 'N/A' }}</td>
          <td>{{ rejection?.rejection?.rejectionReason || 'N/A' }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import {ref, watch} from "vue";

const props = defineProps([ 'submission' ]);
const showRejections = ref(false);
const submissionRejections = ref([] as any[]);

watch(showRejections, (newValue, oldValue) => {
  if (newValue) {
    loadRejections();
  } else {
    submissionRejections.value = []
  }
})

async function loadRejections(pageHash = ""): Promise<void> {
  const resp = await axios.get(`/exchange/v1/businesses/${props.submission.businessId}/display-name-bulk/${props.submission.submissionId}/rejections`, {
    headers: {
      'Authorization': localStorage.getItem("token"),
      'Content-Type': 'application/json'
    },
    params: {
      'page_size': 20,
      'next_page_token': pageHash || null
    }
  });

  if (resp?.data?.body) {
    const rejections = resp.data.body.rejections;
    const nextPageToken = resp.data.body.nextPageToken;

    if (rejections) {
      submissionRejections.value.push(...rejections);
    }

    if (nextPageToken) {
      await loadRejections(nextPageToken)
    }
  }
}

function getSubmissionStatusClass(status: string): string {
  switch (status) {
    case 'STATUS_COMPLETED':
      return 'badge-success';
    case 'STATUS_COMPLETED_WITH_REJECTIONS':
      return 'badge-warning';
    case 'STATUS_IN_PROGRESS':
      return 'badge-info';
    case 'STATUS_PENDING':
      return 'badge-info';
    case 'STATUS_FAILED':
      return 'badge-error';
    case 'STATUS_UNSPECIFIED':
      return '';
    default:
      return '';
  }
}
</script>

<style lang="scss" scoped>

</style>