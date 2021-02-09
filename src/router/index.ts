/*
 * @Author: lianbo
 * @Date: 2021-02-08 20:22:29
 * @LastEditors: lianbo
 * @LastEditTime: 2021-02-09 20:55:51
 * @Description:
 */
import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Scene3d from '../views/Scene3d.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/3d',
    name: 's3d',
    component: Scene3d,
  },
  {
    path: '/',
    name: 's2d',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Scene2d.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
