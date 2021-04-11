<template>
  <div id="container2d" class="container2d">
    <div class="map-edit-menu">
      <div class="map-edit-button">
        <el-button @click="gan"> 干 </el-button>
        <el-button @click="gao"> 搞 </el-button>
      </div>
    </div>
    <div
      ref="container2d"
      class="scene-container"
      :style="{ cursor: vm.cursorText }"
    />
  </div>
</template>

<script>
import { observer } from 'mobx-vue';
import Scene2D from '../scene/2D';
import Model2DActive from '../store/Model2DActive';
import VueStoreData from '../store/VueStoreData';
import { EventMgr, EventEnum } from '../utils/EventManager';
import ObstacleFactory from '../scene/Model/Home/ObstacleFactory';
import { getSpcaeListInfo } from '@/api/space';

/**
 * @author lianbo
 * @date 2020-12-25 09:04:50
 * @Description: map-tree还是很影响性能，具体原因待查
 */
export default observer({
  name: 'Scene2d',
  components: {},
  data() {
    return {
      version: '',
      eleList: [],
      searchRvtId: '',
      vm: Model2DActive,
      expandedKeys: [],
      checkedKeys: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      imgUrl: '',
      isLoading: true,
      scene2d: null,
      testText: 'test',
    };
  },
  computed: {},
  mounted() {
    this.initScene2D();
    EventMgr.on(EventEnum.selectNode, this.selectNodeMethod.bind(this));
    EventMgr.on(EventEnum.initHome, this.initTreeData.bind(this));
    EventMgr.on(EventEnum.updateTree, this.updateTreeChecked.bind(this));
  },
  /**
   * 销毁Vue实例之前，删除render动作
   */
  beforeDestroy() {
    VueStoreData.setEnableStage2D(false);
    Model2DActive.reset();
    this.scene2d.stop();
  },
  methods: {
    initTreeData(data) {
      this.treeData = data;
      this.treeData.forEach((item) => {
        if (item.id) {
          this.checkedKeys.push(item.id);
        }
      });
    },
    updateTreeChecked(vals) {
      this.$nextTick(() => {
        for (const val of vals) {
          this.$refs.mapTree.setChecked(val.id, val.checked);
        }
      });
    },
    selectNodeMethod(id) {
      // console.log(id);
      this.expandedKeys.push(id);
      this.$nextTick(() => {
        this.$refs.mapTree && this.$refs.mapTree.setCurrentKey(id);
        setTimeout(
          function () {
            //TODO: 自动移动scrollview
            // if (this.eleList.length < 1) {
            const ele = this.$refs.mapTree && this.$refs.mapTree.$el;
            if (ele) {
              this.eleList = [
                ...ele.querySelectorAll('span.el-tree-node__label'),
              ];
            }
            // }
            const result = this.eleList.find(
              (item) => item.innerHTML === id.toString()
            );
            // console.log(result);
            if (result) {
              const exeNode = result.parentNode.parentNode;
              exeNode.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'nearest',
              });
            }
          }.bind(this),
          1000
        );
      });
    },
    handleCheck(data, checked) {
      if (data.buildData) {
        data.buildData.visible = checked;
      }
    },
    handleNodeClick(data) {
      if (!data.buildData) return;
      // console.log(this.$refs.mapTree.getCheckedKeys());
      Model2DActive.selection = data.buildData;
      this.scene2d.resetViewForStructure(data.buildData);
      // this.$refs.mapTree.child
    },
    changeV() {
      this.scene2d.syncVertex();
    },
    reRender() {
      this.scene2d.syncRender();
    },
    resize(...size) {
      this.scene2d.resize(...size);
    },
    resetView() {
      this.scene2d.resetView();
    },
    initScene2D() {
      this.scene2d = Scene2D.getInstance();
      VueStoreData.setEnableStage2D(true);
      // return
      setTimeout(async () => {
        await this.scene2d.bindVue(this);
        this.isLoading = false;
        this.eleList = [];
      });
    },
    checkIsEmpty() {
      return this.scene2d.homePlan.checkIsEmpty();
    },
    startEdit() {
      Model2DActive.setEditEdgeState(true);
      // Model2DActive.eventSequence();
    },
    endEdit() {
      // Model2DActive.setEditState(false);
      Model2DActive.setEditEdgeState(false);
    },
    testClick() {
      Model2DActive.setGuidelines(!Model2DActive.editGuidelines);
      this.testText = !Model2DActive.editGuidelines ? 'test' : 'endTest';
    },
    syncSt() {
      if (Model2DActive.editEdgeState) {
        Model2DActive.editStructure.editSeg();
      }
      if (Model2DActive.selection) {
        Model2DActive.editStructure.editPosition();
      }
      if (Model2DActive.editVertexState) {
        Model2DActive.editStructure.editVertex();
      }
    },
    rotateSubject() {
      this.scene2d.updateCoordinate();
    },
    searchStructure() {
      const st = this.scene2d.home.curLevel.findByRvtId(
        this.searchRvtId.toString()
      );
      if (st) {
        Model2DActive.selection = st;
        this.scene2d.resetViewForStructure(st);
      }
    },
    async loadBuild(buildData) {
      console.log(buildData);
      await this.scene2d.loadHomeData(buildData);
    },
    save() {
      return this.scene2d.save();
    },
    obstacle() {
      Model2DActive.setNewStructure(ObstacleFactory.createObstacle());
    },
    gan() {
      alert('xxxxxxxxx');
    },
    gao() {
      alert('gao');
    },
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
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
}

.map-edit-button {
  float: left;
  background: #af5b5e;
}

.scene-container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 5%;
  left: 20%;
}
</style>
