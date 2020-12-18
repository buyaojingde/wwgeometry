<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">2d</router-link>
      |
      <router-link to="/3d">3d</router-link>
    </div>
    <router-view class="main-view"></router-view>
  </div>
</template>

<style>
html,
body,
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #808b94;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.main-view {
  height: 100%;
  width: 100%;
}
</style>
