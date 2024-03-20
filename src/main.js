import { createApp } from 'vue'
import App from './App.vue'
import { firebase as firebaseApp, db as firestore } from './firebase'
import router from './router'
import './assets/style/main.css'
import 'bootstrap/dist/css/bootstrap.css'

const app = createApp(App)


app.config.globalProperties.$firebase = firebaseApp
app.config.globalProperties.$firestore = firestore

app.use(router)
app.mount('#app')