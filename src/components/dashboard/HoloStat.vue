<template>
  <div class="holo-stat glass-panel">
    <div class="row items-center justify-between">
      <div class="text-overline text-grey-4">{{ title }}</div>
      <q-icon :name="icon" :color="color" size="sm" class="glow-icon" />
    </div>
    <div class="text-h4 font-numeric text-white q-mt-xs">
      {{ value }}<span class="text-caption q-ml-xs text-grey-5">{{ unit }}</span>
    </div>
    <div class="trend-indicator row items-center q-mt-sm" :class="trendClass">
      <q-icon :name="trendIcon" size="xs" />
      <span class="text-caption q-ml-xs">{{ trendValue }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String],
  unit: String,
  icon: String,
  color: { type: String, default: 'primary' },
  trend: { type: Number, default: 0 } // Positivo o negativo
})

const trendClass = computed(() => props.trend >= 0 ? 'text-positive' : 'text-negative')
const trendIcon = computed(() => props.trend >= 0 ? 'trending_up' : 'trending_down')
const trendValue = computed(() => `${props.trend > 0 ? '+' : ''}${props.trend}% vs mes anterior`)
</script>

<style lang="scss" scoped>
.holo-stat {
  padding: 16px;
  border-radius: 16px;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 200px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.font-numeric {
  font-family: 'Outfit', sans-serif;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: -1px;
}

.glow-icon {
  filter: drop-shadow(0 0 8px currentColor);
}
</style>
