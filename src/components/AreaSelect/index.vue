<template>
  <el-popover placement="bottom" :width="300" trigger="click" popper-class="area-select-popover">
    <template #reference>
      <div class="inline-flex items-center gap-2 px-4 py-2 cursor-pointer rounded transition-all">
        <el-icon class="text-18px text-[var(--el-color-primary)]">
          <Location />
        </el-icon>
        <span class="text-14px text-[var(--el-text-color-regular)] select-none">{{ selectedArea }}</span>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="400px">
        <!-- 省份列表 -->
        <div v-for="province in provinces" :key="province.code">
          <!-- 省份项 -->
          <div class="flex items-center justify-between group">
            <div
              :class="[
                'flex-1 px-4 py-2.5 cursor-pointer transition-all text-14px',
                selectedCode === province.code
                  ? 'text-[var(--el-color-primary)]'
                  : 'text-[var(--el-text-color-regular)] hover:text-[var(--el-color-primary)]'
              ]"
              @click="handleSelect(province.code, province.name)"
            >
              {{ province.name }}
            </div>
            <el-icon
              :class="[
                'mr-3 cursor-pointer transition-transform text-[var(--el-text-color-secondary)]',
                { 'rotate-90': expandedProvinces.has(province.code) }
              ]"
              @click="toggleProvince(province.code)"
            >
              <ArrowRight />
            </el-icon>
          </div>
          <!-- 城市列表 -->
          <transition name="city-expand">
            <div v-show="expandedProvinces.has(province.code)">
              <div
                v-for="city in province.cities"
                :key="city.code"
                :class="[
                  'pl-8 pr-4 py-2 cursor-pointer transition-all text-14px',
                  selectedCode === city.code
                    ? 'text-[var(--el-color-primary)] bg-[var(--el-color-primary-light-9)]'
                    : 'text-[var(--el-text-color-regular)] hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]'
                ]"
                @click="handleSelect(city.code, city.name)"
              >
                {{ city.name }}
              </div>
            </div>
          </transition>
        </div>
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue"
import { Location, ArrowRight } from "@element-plus/icons-vue"

interface Area {
  code: string
  name: string
}

interface Province extends Area {
  cities: Area[]
}

// 本地省市数据
const provinces = ref<Province[]>([
  {
    code: "110000",
    name: "北京市",
    cities: [{ code: "110100", name: "北京市" }]
  },
  {
    code: "310000",
    name: "上海市",
    cities: [{ code: "310100", name: "上海市" }]
  },
  {
    code: "440000",
    name: "广东省",
    cities: [
      { code: "440100", name: "广州市" },
      { code: "440300", name: "深圳市" },
      { code: "440400", name: "珠海市" },
      { code: "440500", name: "汕头市" },
      { code: "440600", name: "佛山市" },
      { code: "441900", name: "东莞市" },
      { code: "442000", name: "中山市" }
    ]
  },
  {
    code: "330000",
    name: "浙江省",
    cities: [
      { code: "330100", name: "杭州市" },
      { code: "330200", name: "宁波市" },
      { code: "330300", name: "温州市" },
      { code: "330400", name: "嘉兴市" },
      { code: "330500", name: "湖州市" },
      { code: "330600", name: "绍兴市" }
    ]
  },
  {
    code: "320000",
    name: "江苏省",
    cities: [
      { code: "320100", name: "南京市" },
      { code: "320200", name: "无锡市" },
      { code: "320300", name: "徐州市" },
      { code: "320500", name: "苏州市" },
      { code: "320600", name: "南通市" }
    ]
  },
  {
    code: "510000",
    name: "四川省",
    cities: [
      { code: "510100", name: "成都市" },
      { code: "510300", name: "自贡市" },
      { code: "510400", name: "攀枝花市" },
      { code: "510700", name: "绵阳市" }
    ]
  }
])

// 当前选中的区域编码
const selectedCode = ref<string>()
// 当前选中的区域名称
const selectedName = ref<string>()
// 展开的省份集合
const expandedProvinces = ref<Set<string>>(new Set())

// 显示的区域文本
const selectedArea = computed(() => {
  return selectedName.value || "请选择省市"
})

// 切换省份展开/收起
const toggleProvince = (provinceCode: string) => {
  if (expandedProvinces.value.has(provinceCode)) {
    expandedProvinces.value.delete(provinceCode)
  } else {
    expandedProvinces.value.add(provinceCode)
  }
}

// 选择省份或城市（单选）
const handleSelect = (code: string, name: string) => {
  selectedCode.value = code
  selectedName.value = name
  // 触发事件通知父组件
  emit("change", {
    code,
    name
  })
}

// 定义事件
const emit = defineEmits<{
  change: [value: { code: string; name: string }]
}>()
</script>

<style scoped>
/* 城市展开收起动画 */
.city-expand-enter-active,
.city-expand-leave-active {
  transition: max-height 0.3s ease;
  overflow: hidden;
}

.city-expand-enter-from,
.city-expand-leave-to {
  max-height: 0;
}

.city-expand-enter-to,
.city-expand-leave-from {
  max-height: 500px;
}
</style>
