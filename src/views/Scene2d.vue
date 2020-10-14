<template>
  <div class="container2d" id="container2d">
    <div
            ref="container2d"
            class="canvas-container"
            :style="{ cursor: canvasCursor ? `${canvasCursor} !important` : 'auto' }"
    ></div>
  </div>
</template>

<script>
  import Scene2D from '@/scene/2D';
  import Model2DActive from '@/store/Model2DActive';
  import VueStoreData from '@/store/VueStoreData';
  import RouterData from '@/store/RouterData';
  import { EModuleType, ERouterStatus } from '@/global/Enum/EnumData';

  export default {
    name: 'container-2d',
    components: {
    },
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

        if (this.$route.name === '2DStage') {
          RouterData.needFindFlatWalls = true;
          RouterData.wallNeedRefresh = true;
          RouterData.ceilingNeedRefresh = true;
          RouterData.roomNeedRefresh = true;
          RouterData.bgWallNeedRefresh = true;
          RouterData.floorNeedRefresh = true;
          RouterData.patchRoomRefresh = true;
          RouterData.matchBoxRefresh = true;
          RouterData.hole3DRefresh = true;
          RouterData.cubeRefresh = true;
        }

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
