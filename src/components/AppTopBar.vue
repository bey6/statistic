<template>
  <div class="layout-topbar">
    <Button
      class="p-button-text p-button-plain rotate"
      :icon="arrow"
      @click="toggleAppMenu"
    />
    <Divider layout="vertical" />
    <b>{{ $route.meta.label }}</b>

    <div style="flex: 1"></div>
    <Button class="p-button-text p-button-plain" icon="pi pi-bell" />
    <Divider layout="vertical" />
    <Avatar style="margin-right: 1rem" image="img.jpeg" />
    <span>{{ getUserInfo.name }}</span>
    <Divider layout="vertical" />
    <Button
      class="p-button-text p-button-plain"
      icon="pi pi-cog"
      @click="settingsPanelToggle"
      aria-haspopup="true"
      aria-controls="overlay_tmenu"
    />
    <TieredMenu id="overlay_tmenu" ref="menu" :model="items" :popup="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Avatar from 'primevue/avatar'
import TieredMenu from 'primevue/tieredmenu'
import { mapGetters, mapMutations } from 'vuex'

export default defineComponent({
  components: {
    Avatar,
    TieredMenu,
  },
  data() {
    return {
      items: [
        {
          label: '个人设置',
          icon: 'pi pi-fw pi-file',
          to: '/profile',
        },
        {
          separator: true,
        },
        {
          label: '商城',
          icon: 'pi pi-fw pi-shopping-cart',
          to: '/',
        },
        {
          label: '设置',
          icon: 'pi pi-fw pi-cog',
          to: '/settings',
        },
        {
          label: '关于',
          icon: 'pi pi-fw pi-heart',
          to: '/about',
        },
        {
          separator: true,
        },
        {
          label: '退出',
          icon: 'pi pi-fw pi-power-off',
        },
      ],
      arrow: 'pi pi-chevron-left',
    }
  },
  computed: {
    ...mapGetters(['getUserInfo']),
  },
  methods: {
    ...mapMutations(['setUserInfo']),
    // settings panel
    settingsPanelToggle(event: any) {
      this.$refs.menu.toggle(event)
    },
    toggleAppMenu() {
      this.$emit('menu-toggle')
      if (this.arrow === 'pi pi-chevron-left')
        this.arrow = 'pi pi-chevron-right'
      else this.arrow = 'pi pi-chevron-left'
    },
  },
  mounted() {
    this.setUserInfo({ name: 'Tsuyuri Kanao' })
  },
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.totate {
  transition: transform 0.4s cubic-bezier(0.05, 0.74, 0.2, 0.99);
}
@media screen and (max-width: 991px) {
  .rotate {
    transform: rotate(180deg);
  }
}
</style>
