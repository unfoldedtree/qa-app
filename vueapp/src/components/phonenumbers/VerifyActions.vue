<template>
  <div class="stats w-full flex flex-col shadow-2xl">
    <div class="flex flex-row">
      <div class="stat">
        <div class="stat-figure cursor-pointer text-primary" @click="emit('downloadResults', uploadedTotal, 'uploaded-total')">
          <svg fill="none" class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
        </div>
        <div class="stat-title">Uploaded Total</div>
        <div class="stat-value text-primary">{{ formatMetric(uploadedTotal.size) }}</div>
        <div class="stat-desc">Targeted total to match</div>
      </div>

      <div class="stat">
        <div class="stat-figure cursor-pointer text-secondary" @click="emit('downloadResults', uploadedMatched, 'uploaded-matched')">
          <svg fill="none" class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
        </div>
        <div class="stat-title">Uploaded Matched</div>
        <div class="stat-value text-secondary">{{ formatMetric(uploadedMatched.size) }}</div>
        <div class="stat-desc">{{ getPercentage(uploadedTotal.size, uploadedMatched.size) }}% matched</div>
      </div>

      <div class="stat">
        <div class="stat-figure cursor-pointer text-accent" @click="emit('downloadResults', uploadedRemaining, 'uploaded-remaining')">
          <svg fill="none" class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
        </div>
        <div class="stat-title">Uploaded Remaining</div>
        <div class="stat-value text-accent">{{ formatMetric(uploadedRemaining.size) }}</div>
        <div class="stat-desc">{{ getPercentage(uploadedTotal.size, uploadedRemaining.size) }}% remaining</div>
      </div>
    </div>
    <div class="flex flex-row border-none">
      <div class="stat">
        <div class="stat-figure cursor-pointer text-primary" @click="emit('downloadResults', exchangeTotal, 'exchange-total')">
          <svg fill="none" class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
        </div>
        <div class="stat-title">Exchange Total</div>
        <div class="stat-value text-primary">{{ formatMetric(exchangeTotal.size) }}</div>
        <div class="stat-desc">Targeted total to match</div>
      </div>

      <div class="stat">
        <div class="stat-figure cursor-pointer text-secondary" @click="emit('downloadResults', exchangeMatched, 'exchange-matched')">
          <svg fill="none" class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
        </div>
        <div class="stat-title">Exchange Matched</div>
        <div class="stat-value text-secondary">{{ formatMetric(exchangeMatched.size) }}</div>
        <div class="stat-desc">{{ getPercentage(exchangeTotal.size, exchangeRemaining.size) }}% matched</div>
      </div>

      <div class="stat">
        <div class="stat-figure cursor-pointer text-accent" @click="emit('downloadResults', exchangeRemaining, 'exchange-remaining')">
          <svg fill="none" class="inline-block w-8 h-8 stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
        </div>
        <div class="stat-title">Exchange Remaining</div>
        <div class="stat-value text-accent">{{ formatMetric(exchangeRemaining.size) }}</div>
        <div class="stat-desc">{{ getPercentage(exchangeTotal.size, exchangeRemaining.size) }}% remaining</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['downloadResults']);
const props = defineProps(['uploadedTotal', 'uploadedMatched', 'uploadedRemaining', 'exchangeTotal', 'exchangeMatched', 'exchangeRemaining']);

function formatMetric(metric: number): string {
  return nFormatter(metric, 2);
}

function nFormatter(num: any, digits: any) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

function getPercentage(whole: number, fraction: number): string {
  if (whole) {
    return ((fraction / whole) * 100).toFixed(2);
  }

  return (0).toFixed(2);
}
</script>

<style scoped>

</style>