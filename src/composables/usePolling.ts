import { ref, onUnmounted } from 'vue';

export function usePolling(fn: () => Promise<void>, intervalMs: number = 5000) {
  const isPolling = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (isPolling.value) return;
    isPolling.value = true;
    timer = setInterval(async () => {
      try {
        await fn();
      } catch {
        stop();
      }
    }, intervalMs);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isPolling.value = false;
  }

  onUnmounted(stop);

  return { start, stop, isPolling };
}
