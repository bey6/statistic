<template>
  <div class="border">
    <Tags :conditions="conditions" v-model="condition" />
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
