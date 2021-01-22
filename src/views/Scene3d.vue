<template>
  <div class="container3d">
    <div ref="container3d" class="canvas3d"></div>
  </div>
</template>

<script>
import { observer } from 'mobx-vue';
import Scene3D from '../scene/3D/scene3d';
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
      console.log('init');
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
