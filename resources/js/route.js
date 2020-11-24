import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

export default new VueRouter({
    saveScrollPosition: true,
    routes: [
        {
            path: '/',
            component: require('./components/HelloComponent.vue')
        },
    ]
})
