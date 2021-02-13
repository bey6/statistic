import { createStore } from 'vuex'

export default createStore({
  state: {
    appName: 'FSA',
    menuStatus: false,
    menuList: [],
    userInfo: {
      name: '',
      gender: 'females',
      age: 16,
      department: '鬼杀队',
      memo: '写点什么',
    },
  },
  getters: {
    getAppName(state) {
      return state.appName
    },
    getMenuList(state) {
      return state.menuList
    },
    getUserInfo(state) {
      return state.userInfo
    },
    getMenuStatus(state) {
      return state.menuStatus
    },
  },
  mutations: {
    setMenuList(state, payload) {
      state.menuList = payload
    },
    setUserInfo(state, payload) {
      state.userInfo = Object.assign(state.userInfo, payload)
    },
    setMenuStatus(state, payload) {
      state.menuStatus = payload
    },
  },
})
