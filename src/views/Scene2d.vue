<template>
    <div class="container2d" id="container2d">
        <div
                ref="container2d"
                class="canvas-container"
        ></div>
    </div>
</template>

<script>
  import Scene2D from '@/scene/2D';
  import Model2DActive from '@/store/Model2DActive';
  import VueStoreData from '@/store/VueStoreData';
  import RouterData from '@/store/RouterData';
  import {EModuleType, ERouterStatus} from '@/global/Enum/EnumData';

  export default {
    name: 'container-2d',
    components: {},
    data() {
      return {
        imgUrl: '',
        isLoading: true,
        $_scene2d: null,
      };
    },
    mounted() {
      this.initScene2D();
    },
    methods: {
      resize(...size) {
        this.$_scene2d.resize(...size);
      },
      resetView() {
        this.$_scene2d.resetView();
      },
      initScene2D() {
        RouterData.setModuleType(EModuleType.LayoutDesign);
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
  };
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
