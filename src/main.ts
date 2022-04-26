import { createApp } from "vue";
import App from "./App.vue";
import "./css/index.css";
import router from "./router";
import store from "@/store";
import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCjsZH1rviLKTHvI3TWfHAl7s2uoaOYg3E",
  authDomain: "chunding-6e2aa.firebaseapp.com",
  projectId: "chunding-6e2aa",
  storageBucket: "chunding-6e2aa.appspot.com",
  messagingSenderId: "381013076282",
  appId: "1:381013076282:web:18c6b06f5fc6a4d5668803",
};
initializeApp(firebaseConfig);

if (import.meta.env.DEV) {
  const db = getFirestore();
  connectFirestoreEmulator(db, "localhost", 8080);
}
const app = createApp(App);

app.use(store);
app.use(router);
app.mount("#app");
