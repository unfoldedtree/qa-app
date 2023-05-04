<template>
  <div
      :class="`alert ${toastColor}`"
      @click.prevent="close"
      :ref="id"
  >
    <div>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

// Props for our component,
// these are the same as Notitfication interface.
const props = defineProps({
  id: { type: String, required: true },
  type: {
    type: String,
    default: "info",
    required: false,
  },
  // title: { type: String, default: null, required: false },
  message: {
    type: String,
    default: "Ooops! A message was not provided.",
    required: false,
  },
  autoClose: { type: Boolean, default: true, required: false },
  duration: { type: Number, default: 5, required: false },
});

// Defining emits
// for closing a notification
const emit = defineEmits<{
  (e: "close"): void;
}>();

// some reactive values to manage the notification
const timer = ref(-1);
const startedAt = ref<number>(0);
const delay = ref<number>(0);

// setting up the automatic
// dismissing of notificaton
// after the specified duration
onMounted(() => {
  if (props.autoClose) {
    startedAt.value = Date.now();
    delay.value = props.duration * 1000;
    timer.value = setTimeout(close, delay.value);
  }
});

const toastColor = computed(() => {
  switch (props.type) {
    case "error":
      return "alert-error";
    case "warning":
      return "alert-warning";
    case "success":
      return "alert-success";
    default:
      return "alert-info";
  }
});

// a method to close the
// notification and emit the action
const close = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
</style>