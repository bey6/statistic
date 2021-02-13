<template>
  <div class="layout-menu">
    <div class="layout-logo">
      <a href="/" class="logo">{{ getAppName }}</a>
    </div>
    <Divider />
    <div class="layout-container">
      <Menu :model="getMenuList" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Menu from 'primevue/menu'
import { mapGetters, mapMutations } from 'vuex'

export default defineComponent({
  components: {
    Menu,
  },
  computed: {
    ...mapGetters(['getAppName', 'getMenuList']),
  },
  methods: {
    ...mapMutations(['setMenuList']),
  },
  created() {
    fetch('routes.json').then((httpRes) => {
      httpRes.json().then((jsonRes) => {
        this.setMenuList([jsonRes])
      })
    })
  },
})
</script>

<style lang="scss" scoped>
.layout-logo {
  text-align: center;
  height: 50px;
  .logo {
    font-size: 2rem;
    line-height: 50px;
  }
}
.layout-container {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>
