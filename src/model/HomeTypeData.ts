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
  protected gottenHome: Home;

  protected hasRequest = null;

  constructor() {
    window.addEventListener('beforeunload', e => {
      if (scene2D.getInstance().home.curLevel.rooms.length === 0) {
        e = e || window.event;
        // 兼容IE8和Firefox 4之前的版本
        if (e) {
          e.returnValue = '关闭提示';
        }
        // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
        return '关闭提示';
      }
    });
  }

  public get() {
    if (!this.gottenHome) {
      throw new Error('还未获取到Home');
    }
    return this.gottenHome;
  }

  private async _getHome(from?: string, path?: any) {
    if(from == 'local'){
      this.gottenHome = HomeConvert.convert();
      return this.gottenHome;
    }
  }

  public async getHome(from?: string, path?: any) {
    if (!this.hasRequest) {
      this.hasRequest = this._getHome(from, path);
    }

    let res = null;
    try {
      res = await this.hasRequest;
    } catch (e) {
      if (/auth\ fail/.test(e.message)) {
      }
      throw e;
    } finally {
      this.hasRequest = null;
    }
    return res;
  }

  public async saveActionBim() {
    const home = scene2D.getInstance().home;
    const homeData = null;
    const str = JSON.stringify(homeData);
    const file = new File([str], 'pave.json', { type: 'text/plain;charset=utf-8' });
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
  /**
   * 户型是否已经加载
   * @returns {boolean}
   */
  @computed
  get isHomeLoaded() {
    return !!this.gottenHome;
  }
}

export default new HomeTypeData();
