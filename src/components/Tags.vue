<template>
  <TabView>
    <TabPanel v-for="con in conditions" :key="con.key" :header="con.name">
      <ul class="condition-list">
        <li v-for="tag in con.tags" :key="tag.key" @click="onTagClick(tag)">
          {{ tag.name }}
        </li>
      </ul>
    </TabPanel>
  </TabView>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Tag } from '../interface'

export default defineComponent({
  props: {
    conditions: Array,
    modeValue: Object,
  },
  emits: ['update:modelValue'],
  methods: {
    onTagClick(tag: Tag) {
      this.$emit('update:modelValue', tag)
    },
  },
  watch: {
    conditions: {
      handler(nv, ov) {
        console.log(nv)
      },
    },
  },
})
</script>
<style lang="scss" scoped>
.condition-list {
  display: flex;
  padding: 8px;
  margin: 0;
  flex-wrap: wrap;
  list-style: none;

  li {
    margin: 0 8px 8px 0;
    padding: 0 12px;
    border: 1px solid #ced4da;
    background-color: #fafafa;
    border-radius: 3px;
    height: 32px;
    line-height: 32px;

    &:hover {
      background-color: #e6e8ec;
      cursor: default;
    }
  }
}
</style>
