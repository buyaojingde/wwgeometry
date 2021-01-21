/**
 * * by lianbo.guo
 **/
// import { saveAs } from 'file-saver';
import { computed, observable } from 'mobx';
import Home from '../scene/Model/Home/Home';
import HomeConvert from '../utils/HomeConvert';

const scene2D = require('../scene/2D').default;

class HomeTypeData {
  @observable.ref
  // @ts-ignore
  protected gottenHome: Home;

  protected hasRequest = null;

  constructor() {}

  /**
   * 户型是否已经加载
   * @returns {boolean}
   */
  @computed
  get isHomeLoaded() {
    return !!this.gottenHome;
  }

  public get() {
    if (!this.gottenHome) {
      throw new Error('还未获取到Home');
    }
    return this.gottenHome;
  }

  public async getHome(from?: string, path?: any) {
    if (!this.hasRequest) {
      // @ts-ignore
      this.hasRequest = this._getHome(from, path);
    }

    let res = null;
    try {
      res = await this.hasRequest;
    } catch (e) {
      throw new Error(e);
    } finally {
      this.hasRequest = null;
    }
    return res;
  }

  public async saveActionBim() {
    const home = scene2D.getInstance().home;
    const homeData = null;
    const str = JSON.stringify(homeData);
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

  private async _getHome(from?: string, path?: any) {
    // if (from == 'local') {
    //   const obj = require('../../../Downloads/博智林机器人创研中心6号楼土建6F.json');
    //   this.gottenHome = HomeConvert.convert(obj);
    //   return this.gottenHome;
    // }
  }
}

export default new HomeTypeData();
