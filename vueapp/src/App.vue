<template>
  <div>
    <RouterView />
  </div>
  <div class="toast toast-top toast-end">
    <TransitionGroup name="list">
      <ToastNotification
          v-for="(item) in notifications"
          :key="item.id"
          :id="item.id"
          :type="item.type"
          :message="item.message"
          :auto-close="item.autoClose"
          :duration="item.duration"
          @close="() => { removeNotifications(item.id) }"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import {TransitionGroup, provide} from "vue";
import { RouterView } from 'vue-router';
import useNotifications from "@/plugins/notifications";
import ToastNotification from "@/components/toast/ToastNotification.vue";

const {
  notifications,
  createNotification,
  removeNotifications,
} = useNotifications();

provide("create-notification", createNotification);
</script>

<style lang="scss" scoped>
  .list-enter-active,
  .list-leave-active {
    transition: all 0.75s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(75px);
  }
</style>
