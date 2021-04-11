/**
 * * by lianbo.guo
 **/
import Stats from 'stats.js';
// import { saveAs } from 'file-saver';
import { getSpcaeListInfo } from '../api/space';
import Home from '../scene/Model/Home/Home';
import HomeConvert from '../utils/HomeConvert';

const scene2D = require('../scene/2D').default;

class HomeTypeData {
  public gottenHome: Home = new Home();

  private version: any;

  public async saveActionBim() {
    const str = JSON.stringify(this.gottenHome);
    const file = new File([str], 'pave.json', {
      type: 'text/plain;charset=utf-8',
    });
    // saveAs(file);
    // axioss.post(devLuo, str, {headers: {
    //     'Content-Type': 'application/json'}}) .then(response => {
    //   console.log(response);
    // })
    //   .catch(error => {
    //     console.log(error);
    //   });
    // console.log(res);
  }

  public async getHome(bimMapCode = 'P000001-B0006-F0006') {
    if (this.gottenHome) return this.gottenHome;
    try {
      const res = await getSpcaeListInfo(bimMapCode);
      return this.processData(res);
    } catch (error) {
      console.warn(error || '加载几何信息模型异常');
      const res = await require('../../devTools/P000001-B0006-F0006.json');
      return this.processData(res);
    }
  }
  processData(res: any): Home {
    if (res.data) {
      this.version = res.data.editedHistory
        ? res.data.editedHistory.version
        : null;
      this.gottenHome = HomeConvert.extractData(res.data);
      this.initStats();
      return this.gottenHome;
    }
    return this.gottenHome;
  }

  initStats() {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
    stats.dom.style.cssText =
      'position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';

    function animate() {
      stats.begin();

      // monitored code goes here

      stats.end();

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
}

export default new HomeTypeData();
