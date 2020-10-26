<template>
  <div class="container2d" id="container2d">
    <button @click="change">123</button>
    <p>{{ vm.text }}</p>
    <el-input v-model="vm.text" @change="changeNumber"></el-input>
    <el-input v-model="vm.vec3.x"></el-input>
    <el-input v-model="vm.vec3.y"></el-input>
    <el-input v-model="vm.vec3.z"></el-input>
    <div
      ref="container2d"
      class="canvas-container"
      :style="{
        cursor: vm.canvasCursor,
      }"
    ></div>
  </div>
</template>

<script>
import Scene2D from "@/scene/2D";
import Model2DActive from "@/store/Model2DActive";
import VueStoreData from "@/store/VueStoreData";
import { observer } from "mobx-vue";

export default observer({
  name: "container-2d",
  components: {},
  data() {
    return {
      vm: Model2DActive,
      imgUrl: "",
      isLoading: true,
      $_scene2d: null,
    };
  },
  mounted() {
    this.initScene2D();
  },
  methods: {
    changeNumber(val) {
      console.log(val);
    },
    resize(...size) {
      this.$_scene2d.resize(...size);
    },
    resetView() {
      this.$_scene2d.resetView();
    },
    initScene2D() {
      this.$_scene2d = Scene2D.getInstance();
      VueStoreData.setEnableStage2D(true);

      // return
      setTimeout(async () => {
        await this.$_scene2d.bindVue(this);
        this.isLoading = false;
      });
    },
    checkIsEmpty() {
      return this.$_scene2d.homePlan.checkIsEmpty();
    },
    change() {
      Model2DActive.setEditState(!Model2DActive.editState);
    },
  },
  computed: {
    mobxVueTest() {
      return Model2DActive.text;
    },
    canvasCursor() {
      return Model2DActive.canvasCursor;
    },
  },
  /**
   * 销毁Vue实例之前，删除render动作
   */
  beforeDestroy() {
    // this.$Ticker.remove(this.render)
    // this.$_scene2d.dispose()
    VueStoreData.setEnableStage2D(false);
    Model2DActive.init();
    this.$_scene2d.stop();
  },
});
</script>
<style>
.container2d {
  position: relative;
  width: 100%;
  height: 100%;
  background: #464646;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-container {
  position: relative;
  height: 100%;
  width: 100%;
}

/*canvas {*/
/*    !*pointer-events: none;*!*/
/*    position: absolute;*/
/*    width: 100%;*/
/*    height: 100%;*/
/*    top: 0;*/
/*    left: 0;*/
/*}*/
</style>
