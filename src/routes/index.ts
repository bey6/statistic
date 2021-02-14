import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Packages from '../pages/Packages.vue'
import About from '../pages/About.vue'
import Profile from '../pages/Profile.vue'
import Settings from '../pages/Settings.vue'
import Result from '../pages/Result.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: {
      label: '主页',
    },
  },
  {
    path: '/packages',
    component: Packages,
    meta: {
      label: '包',
    },
  },
  {
    path: '/result',
    component: Result,
    meta: {
      label: '结果',
    },
  },
  {
    path: '/profile',
    component: Profile,
    meta: {
      label: '个人信息',
    },
  },
  {
    path: '/settings',
    component: Settings,
    meta: {
      label: '设置',
    },
  },
  {
    path: '/about',
    component: About,
    meta: {
      label: '关于',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.label) {
    document.title = to.meta.label
  }
  next()
})

export default router
