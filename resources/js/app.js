// require('./bootstrap');
// window.Vue = require('vue');
// import VueRouter from 'vue-router';
// Vue.use(VueRouter);
// import routes from './route';    // 路由配置文件
// // 实例化路由
// const router = new VueRouter({
//     routes
// })
// var vm = new Vue({
//     router
// }).$mount('#app');

require('./bootstrap');
window.Vue = require('vue');

var app = new Vue({
    el: '#app',
    data: {
        url: 'foo'
    },
    template: '<a v-bind:href="url">url尝试</a>'
});
