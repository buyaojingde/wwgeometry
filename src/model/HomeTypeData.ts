/**
 * * by lianbo.guo
 **/
// import { saveAs } from 'file-saver';
import { getSpcaeListInfo } from '../api/space';
import Home from '../scene/Model/Home/Home';
import HomeConvert from '../utils/HomeConvert';

const scene2D = require('../scene/2D').default;

class HomeTypeData {
  public gottenHome!: Home;

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
      return this.gottenHome;
    }
    return this.gottenHome;
  }
}

export default new HomeTypeData();
