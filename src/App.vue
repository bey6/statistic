<template>
  <div class="layout-wrapper">
    <AppTopBar
      @menu-toggle="onMenuToggle"
      :class="{ 'topbar--relaxation': getMenuStatus }"
    />
    <AppMenu :class="{ 'menu--toggle': getMenuStatus }" />
    <AppContent :class="{ 'content--relaxation': getMenuStatus }" />
    <AppFooter :class="{ 'footer--relaxation': getMenuStatus }" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import AppTopBar from './components/AppTopBar.vue'
import AppMenu from './components/AppMenu.vue'
import AppContent from './components/AppContent.vue'
import AppFooter from './components/AppFooter.vue'
import { mapGetters, mapMutations } from 'vuex'

export default defineComponent({
  name: 'App',
  components: {
    AppMenu,
    AppTopBar,
    AppContent,
    AppFooter,
  },
  computed: {
    ...mapGetters(['getMenuStatus']),
  },
  methods: {
    ...mapMutations(['setMenuStatus']),
    onMenuToggle() {
      this.setMenuStatus(!this.getMenuStatus)
    },
  },
})
</script>
<style scoped>
@media screen and (max-width: 991px) {
  .layout-wrapper .menu--toggle {
    transform: translateX(0%);
  }
  .layout-wrapper .topbar--relaxation {
    padding-left: 232px;
  }
}

@media screen and (min-width: 991px) {
  .layout-wrapper .menu--toggle {
    transform: translateX(-100%);
  }
  .layout-wrapper .topbar--relaxation {
    padding-left: 8px;
  }
}

.layout-wrapper .content--relaxation {
  margin-left: 0;
}
.layout-wrapper .footer--relaxation {
  padding-left: 26px;
}
</style>
