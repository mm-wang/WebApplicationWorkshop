import {default as routes} from "./routes";

const router = new VueRouter({
  mode: 'history',
  routes: routes
});

console.log(router);

router.beforeEach((to, from, next) => {
  if(to.meta && to.meta.title) {
    document.title = to.meta.title(to);
  }
  next()
});

const app = new Vue({
  router
}).$mount('#app');
console.log(app);
