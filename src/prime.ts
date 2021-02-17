import primevue from 'primevue/config'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

//// 如果需要覆盖样式，请解锁这个
import './styles/_overrides.scss'
// import 'primeflex/src/_variables.scss';
// import 'primeflex/src/_grid.scss';
// import 'primeflex/src/_formlayout.scss';
// import 'primeflex/src/_display.scss';
// import 'primeflex/src/_text.scss';
// import 'primeflex/src/flexbox/_flexbox.scss';
// import 'primeflex/src/_spacing.scss';
// import 'primeflex/src/_elevation.scss';

// 全局组件
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import RadioButton from 'primevue/radiobutton'
import Dropdown from 'primevue/dropdown'
import Divider from 'primevue/divider'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ScrollPanel from 'primevue/scrollpanel'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dialog from 'primevue/dialog'

export default (app: any) => {
  app.use(primevue, { ripple: true })
  let c = {
    Button,
    Card,
    InputText,
    Textarea,
    Dropdown,
    RadioButton,
    Divider,
    DataTable,
    Column,
    TabView,
    TabPanel,
    ScrollPanel,
    Dialog,
  }

  Object.keys(c).forEach((k: string) => {
    app.component(k, c[k])
  })
}
