<template>
  <div>
    <b>检索权益</b>
    <div class="border">
      <div style="margin: 20px">
        <span style="margin-right: 12px"
          >拥有者: {{ $store.state.userInfo.name }}
        </span>
        <span style="margin-right: 12px">授权日期: 2021-02-24 13:59:21</span>
        <span>签名: a8c99bceef1</span>
      </div>
    </div>
    <b>字段</b>
    <div class="border">
      <Tags :conditions="conditions" v-model="condition" />
    </div>
    <b>聚合</b>
    <div class="border">
      <div class="p-d-flex p-flex-wrap p-ml-4 p-mt-4 p-mr-4">
        <div class="border p-mb-4 p-mr-4 p-p-2">诊断费用顺位表</div>
        <div class="border p-mb-4 p-mr-4 p-p-2">诊断费用顺位表</div>
        <div class="border p-mb-4 p-mr-4 p-p-2">诊断费用顺位表</div>
        <div class="border p-mb-4 p-mr-4 p-p-2">诊断费用顺位表</div>
        <div class="border p-mb-4 p-mr-4 p-p-2">诊断费用顺位表</div>
        <div class="border p-mb-4 p-mr-4 p-p-2">诊断费用顺位表</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tags from '../components/Tags.vue'

export default defineComponent({
  components: {
    Tags,
  },
  data() {
    return {
      conditions: [],
      condition: {},
    }
  },
  created() {
    fetch('/conditions.json').then((http) =>
      http.json().then((res) => {
        this.conditions = res.conditions
        console.log(this.conditions)
      })
    )
  },
  watch: {
    condition: {
      handler(nv) {
        console.log(nv)
      },
    },
  },
})
</script>
