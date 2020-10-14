/**
 * 用于await 方式处理异步等待
 * @param {*} time
 */
import pkg from '../../package.json';
import WebData from '../model/WebData';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

export function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export function download(url) {
  const aLink = document.createElement('a');
  const lastIndex = url.lastIndexOf('/') + 1;
  let fileName = url.substring(lastIndex);
  if (fileName.indexOf('?') > -1) {
    fileName = fileName.split('?')[0];
  }
  aLink.download = fileName;
  aLink.href = url;
  const evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', false, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); //initEvent 不加后两个参数在FF下会报错
  aLink.dispatchEvent(evt);
}

/**
 * 判断用户操作系统
 * @returns {string}
 */
export const validataOS = (function() {
  let cache = null;

  return function _action() {
    if (!!cache) return cache;
    if (navigator.userAgent.indexOf('Window') > 0) {
      cache = 'Windows';
    } else if (navigator.userAgent.indexOf('Mac OS X') > 0) {
      cache = 'Mac';
    } else if (navigator.userAgent.indexOf('Linux') > 0) {
      cache = 'Linux';
    } else {
      cache = 'NULL';
    }
    return cache;
  };
})();

export function getOs() {
  if (navigator.userAgent.indexOf('SE 2.X') > 0) {
    return 'sougou'; //sougou浏览器
  }
  if (navigator.userAgent.indexOf('MSIE') > 0) {
    return 'MSIE'; //ie浏览器
  }
  if (navigator.userAgent.indexOf('Firefox') > 0) {
    return 'Firefox'; //Firefox浏览器
  }
  if (navigator.userAgent.indexOf('Chrome') > 0) {
    return 'Chrome'; //Chrome浏览器
  }

  if (navigator.userAgent.indexOf('Safari') > 0) {
    return 'Safari'; //Safari浏览器
  }
  if (navigator.userAgent.indexOf('Gecko/') > 0) {
    return 'Gecko';
  }
}
/**
 * canvas的分辨率
 * @type {number}
 */
export const canvasDPI = (() => {
  if (validataOS() === 'Mac') {
    return 2;
  } else {
    return 1;
  }
})();


export function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod');
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
/**
 * http(s) => https
 * @param url
 * @returns {*}
 */
export function translateToHttps(url = '') {
  return url ? url.replace(/^http:(.*)$/, 'https:$1') : '';
}

/**
 * 是否是商家后台进入homeapp
 */
export function isBusinessSys() {
  const url = window.location.href;
  if (url.indexOf('?') === -1) {
    return false;
  }
  const reg = new RegExp('(^|&)' + 'referer' + '=([^&]*)(&|$)');
  const referer = url.substr(url.lastIndexOf('?') + 1).match(reg);
  return referer && referer.indexOf('businesssystem') !== -1;
}

/**
 * 获取元素的位置
 */
export function getElementPosition(el) {
  if (!el) {
    return;
  }
  const elAttribute = el.getBoundingClientRect();
  let useAttribute = {};
  useAttribute.top = elAttribute.top;
  useAttribute.left = elAttribute.left;
  useAttribute.width = elAttribute.width;
  useAttribute.height = elAttribute.height;
  useAttribute.right = document.documentElement.clientWidth - elAttribute.right;
  useAttribute.bottom = document.documentElement.clientHeight - elAttribute.bottom;
  return useAttribute;
}

/**
 * 获取当前发布的版本号
 */
export function getVersion() {
  return pkg.version;
}

/**
 * 判断是否是装企登陆
 */
export function isDecorationCompanyLanding() {
  return WebData.getInstance().role === 2;
}

/**
 * 判断是否是个人登陆进入编辑器（区分个人与商家）
 */
export function isPersonalEnter() {
  const role = WebData.getInstance().role,
    businessRole = [2, 6, 7]; // 商家角色
  const index = findIndex(businessRole, item => item === Number(role));
  return index === -1;
}

/**
 * 适配模型列表数据
 * @param modelList 接口返回的模型列表数据
 */
export function modelItemAdapter(modelList) {
  let useModelList = [],
    currentIndex = 0;
  if (!modelList) {
    return useModelList;
  }
  modelList.forEach((each, index) => {
    if (each.GoodsVo && !isEmpty(each.GoodsVo) && each.GoodsVo.length > 1) {
      each.GoodsVo.forEach((data, i) => {
        if (data) {
          data.hasMultipleGoods = true;
          data.currentIndex = i;
          if (data.mongoData) {
            data.url = data.mongoData.views[0].url;
          } else {
            data.url = data.s_img;
          }
          // 后台给的GoodsVo数据里面无id字段，需前端自取modelId/materialId/textureId值为id
          if (each.material_type === 0) {
            // 模型
            data.id = data.modelId;
          } else if (each.material_type === 1) {
            // 贴图
            data.id = data.textureId;
          } else if (each.material_type === 2) {
            // 材质
            data.id = data.materialId;
          }
          if (String(data.id) === String(each.id)) {
            currentIndex = i;
          }
        }
      });
    }
    if (each) {
      useModelList[index] = cloneDeep(each);
      delete useModelList[index].GoodsVo;
      useModelList[index].listIndex = index;
      each.GoodsVo && !isEmpty(each.GoodsVo) && Object.assign(useModelList[index], each.GoodsVo[currentIndex]);
    }
  });
  return useModelList;
}

/**
 * 订阅EventEmit 并返回释放方法
 * @param eventEmit
 * @param type
 * @param fn
 * @returns {function(): *}
 */
export function observeEventEmit(eventEmit, type, fn) {
  eventEmit.on(type, fn);
  return () => eventEmit.off(type, fn);
}

/**
 * 释放监听数组
 * @param fns
 */
export function disposeArrFn(fns) {
  while (fns.length) {
    const fn = fns.pop();
    if (typeof fn === 'function') {
      fn();
    }
  }
}

/**
 * 检测点是否在画布区内，
 * @param pos 传入的待检测的点
 * @returns 返回经过计算得到的在画布区内的点
 */
export function detectionPoints(pos) {
  if (!pos) {
    return pos;
  }
  //画布区大小为 12000*12000
  const scene2dSize = 12000 / 2;
  pos.x = Math.min(Math.max(pos.x, -scene2dSize), scene2dSize);
  if (pos.z) {
    pos.z = Math.min(Math.max(pos.z, -scene2dSize), scene2dSize);
  } else {
    pos.y = Math.min(Math.max(pos.y, -scene2dSize), scene2dSize);
  }
  return pos;
}

/**
 * 获取内网IP
 * @param {*} onNewIP
 */
export function getUserIP(onNewIP) {
  //  onNewIp - your listener function for new IPs
  //compatibility for firefox and chrome
  var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var pc = new myPeerConnection({
      iceServers: [],
    }),
    noop = function() {
    },
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

  function iterateIP(ip) {
    if (!localIPs[ip]) onNewIP(ip);
    localIPs[ip] = true;
  }

  //create a bogus data channel
  pc.createDataChannel('');

  // create offer and set local description
  pc.createOffer()
    .then(function(sdp) {
      sdp.sdp.split('\n').forEach(function(line) {
        if (line.indexOf('candidate') < 0) return;
        line.match(ipRegex).forEach(iterateIP);
      });

      pc.setLocalDescription(sdp, noop, noop);
    })
    .catch(function(reason) {
      // An error occurred, so handle the failure to connect
    });

  //sten for candidate events
  pc.onicecandidate = function(ice) {
    if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
    ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
  };
}

/**
 * 解析url,获取指定参数
 */

export function getUrlParam(param) {
  const searchUrl = window.location.search;
  const searchParam = searchUrl.slice(searchUrl.indexOf('?') + 1);
  const paramsArr = searchParam.split('&');
  const allParams = {};
  paramsArr.forEach(item => {
    allParams[item.split('=')[0]] = item.split('=')[1];
  });
  return allParams[param];
}
