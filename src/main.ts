import { createApp } from 'vue'
// TypeScript error? Run VSCode command
// TypeScript: Select TypeScript version - > Use Workspace Version
import App from './App.vue'
import Router from './routes/index'
import Store from './store/index'
import setupPrime from './prime';

const app = createApp(App)
setupPrime(app)
import './styles/style.css'
app.use(Router)
app.use(Store)
app.mount('#app')
