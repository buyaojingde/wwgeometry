<!--
 * @Author: lianbo
 * @Date: 2021-02-08 21:49:12
 * @LastEditors: lianbo
 * @LastEditTime: 2021-02-09 20:53:10
 * @Description: 
-->
<template>
  <div class="container3d">
    <div ref="container3d" class="canvas3d"></div>
  </div>
</template>

<script>
import { observer } from 'mobx-vue';
import Scene3D from '../scene/3D';
export default observer({
  name: 'Scene3d',
  components: {},
  data() {
    return {
      testText: 'test',
      scene: null,
    };
  },
  computed: {},
  mounted() {
    this.initScene3d();
  },
  methods: {
    initScene3d() {
      this.scene = Scene3D.getInstance();
      setTimeout(() => {
        this.render = () => {
          this.scene.render();
        };
        // this.$Ticker.add(this.render); // 加入渲染关键帧

        this.scene.bindVue(this);

        this.isLoading = false;
        // this.render();
      }, 0);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container3d {
  margin: 0;
  padding: 0;
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;
  background: #fff;
}
.canvas3d {
  height: 100%;
  width: 100%;
}
</style>
