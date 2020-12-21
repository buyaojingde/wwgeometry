<template>
  <div id="container2d" class="container2d">
    <div class="map-edit-menu">
      <div class="map-edit-button">
        <el-button @click="startEdit"> edit </el-button>
        <el-button @click="endEdit"> end-edit </el-button>
      </div>

      <div class="map-edit-input" style="display: -webkit-flex; display: flex">
        <div class="edit-input" style="display: -webkit-flex; display: flex">
          x:
          <el-input
            @change="syncSt"
            v-model="vm.structureVec3.x"
            type="number"
          />
          y:
          <el-input
            @change="syncSt"
            v-model="vm.structureVec3.y"
            type="number"
          />
          radians:
          <el-input @change="syncSt" v-model="vm.radians" type="number" />
        </div>
        <el-button @click="changeV"> submit </el-button>
        <el-button @click="reRender"> render </el-button>
        <el-button @click="testClick">
          {{ testText }}
        </el-button>
        <el-input
          @change="rotateSubject"
          v-model="vm.subjectVec3.z"
          type="number"
        ></el-input>
        <el-input @change="searchStructure" v-model="searchRvtId"></el-input>
        <el-checkbox v-model="vm.showAxis">显示轴网</el-checkbox>
      </div>
    </div>
    <div class="map-tree">
      <el-tree
        ref="mapTree"
        :default-expanded-keys="expandedKeys"
        :default-checked-keys="checkedKeys"
        node-key="id"
        :data="treeData"
        :props="defaultProps"
        highlight-current
        render-after-expand
        default-expand-all
        show-checkbox
        @node-click="handleNodeClick"
        @check-change="handleCheck"
      />
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

export default observer({
  name: 'Scene2d',
  components: {},
  data() {
    return {
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
    EventMgr.on(EventEnum.selectNode, this.selectNodeMethod);
    EventMgr.on(EventEnum.initHome, this.initTreeData);
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
    selectNodeMethod(id) {
      // console.log(id);
      this.$nextTick(() => {
        this.$refs.mapTree && this.$refs.mapTree.setCurrentKey(id);
        this.expandedKeys.push(id);
        setTimeout(() => {
          //TODO: 自动移动scrollview
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
        });
      });
    },
    handleCheck(data, checked) {
      if (data.buildData) {
        data.buildData.visible = checked;
      }
    },
    handleNodeClick(data) {
      // console.log(data);
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
        this.eleList = [
          ...document.querySelectorAll('span.el-tree-node__label'),
        ];
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
      Model2DActive.setSubjectState(!Model2DActive.subjectState);
      this.testText = !Model2DActive.subjectState ? 'test' : 'endTest';
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
      await this.$_scene2d.loadHomeData(buildData);
      // console.log(buildData);
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

.map-edit-menu {
  position: absolute;
  background: #ffffff;
  width: 100%;
  height: 40px;
}

.map-edit-button {
  float: left;
  background: #af5b5e;
}

.map-tree {
  overflow: auto;
  background: #ffffff;
  height: 100%;
  width: 20%;
  position: absolute;
  top: 40px;
}

.scene-container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 40px;
  left: 20%;
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
