<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NSpin } from 'naive-ui';

const router = useRouter();

onMounted(() => {
  router.replace('/');
});
</script>

<template>
  <n-spin :show="true" style="display: flex; justify-content: center; margin-top: 40vh" />
</template>
