/* eslint-disable prefer-const,no-extra-boolean-cast */
/**
 * * by lianbo.guo
 **/
import { validataOS } from '../utils';
import findIndex from 'lodash/findIndex';

export default {
  common: [
    {
      key: 'ctrl+c',
      action: 'copy',
    },
    {
      key: 'delete',
      action: 'delete',
    },
    {
      key: 'r',
      action: 'rotate',
    },
    {
      key: 'escape',
      action: 'cancel',
    },
    {
      key: 'ctrl+shift+g',
      action: 'splitGroup',
    },
    {
      key: 'ctrl+g',
      action: 'group',
    },
    {
      key: 'g',
      action: 'mirror',
    },
    {
      key: '3',
      action: 'switchTo3D',
    },
    {
      key: '4',
      action: 'switchToSculpt',
    },
    {
      key: ' ',
      action: 'resetView',
    },
    {
      key: 'ctrl+s',
      action: 'saveHme',
    },
    {
      key: 'ctrl+z',
      action: 'undoAction',
    },
    {
      key: 'ctrl+y',
      action: 'redoAction',
    },
    {
      key: '1',
      action: 'switchTo2D',
    },
    {
      key: '2',
      action: 'switchToCeil',
    },
    {
      key: '9',
      action: 'renderImg',
    },
    {
      key: 'ctrl+alt+d',
      action: 'showHotKey',
    },
    {
      key: '-',
      action: 'prev',
    },
    {
      key: '=',
      action: 'next',
    },
    {
      key: '+',
      action: 'next',
    },
    {
      key: 'm',
      action: 'replace',
    },
  ],
  Stage2D: [
    {
      key: 'k',
      action: 'drawRoom',
    },
    {
      key: 'l',
      action: 'drawWall',
    },
    {
      key: 'F8',
      action: 'orthogonal',
    },
  ],
  viewControl: [
    {
      key: 'w',
      action: 'moveTop',
    },
    {
      key: 's',
      action: 'moveBottom',
    },
    {
      key: 'a',
      action: 'moveLeft',
    },
    {
      key: 'd',
      action: 'moveRight',
    },
  ],
  viewControl3D: [
    {
      key: 'w',
      action: 'moveForward',
    },
    {
      key: 's',
      action: 'moveBackward',
    },
    {
      key: 'a',
      action: 'moveLeft',
    },
    {
      key: 'd',
      action: 'moveRight',
    },
    {
      key: 'q',
      action: 'moveBottom',
    },
    {
      key: 'e',
      action: 'moveTop',
    },
  ],
  modelControl: [
    {
      key: 'ArrowUp',
      action: 'moveTop',
    },
    {
      key: 'ArrowDown',
      action: 'moveBottom',
    },
    {
      key: 'ArrowLeft',
      action: 'moveLeft',
    },
    {
      key: 'ArrowRight',
      action: 'moveRight',
    },
    {
      key: 'escape',
      action: 'cancel',
    },
    {
      key: 'z',
      action: 'lookModel',
    },
  ],
};

// export const KeyUpMap = {};

export const getFilters = (function () {
  const cachefilters = new Map();

  return function f(keyMap) {
    if (!!cachefilters.get(keyMap)) return cachefilters.get(keyMap);
    let filtersArr = [];
    for (let actions of keyMap) {
      let reg = actions.key;

      let regArr = reg !== '+' ? reg.split('+') : ['+'];

      // 获取所有的filters
      let filters = (() => {
        const result = {};

        const specialKeys = ['ctrl', 'shift', 'alt', 'meta'];
        specialKeys.forEach((key) => (result[`${key}Key`] = false));

        while (regArr.length) {
          const key = regArr.pop();
          if (specialKeys.includes(key)) {
            result[`${key}Key`] = true;
          } else {
            try {
              result.key = new RegExp(`^(${key})$`, 'i');
            } catch (e) {
              result.key = new RegExp(`^(\\${key})$`, 'i');
            }
          }
        }

        let os = validataOS();
        // 兼容Mac ,调换ctrl 与 meta
        if (os === 'Mac') {
          const tmp = result.metaKey;
          result.metaKey = result.ctrlKey;
          result.ctrlKey = tmp;
        }

        return result;
      })();

      if (!Object.keys(filters)) throw 'filter make error';

      filtersArr.push(filters);
    }

    cachefilters.set(keyMap, filtersArr);

    return filtersArr;
  };
})();

/**
 * 传入key event，和keyMap，返回action
 * @param event
 * @param keyMap
 * @returns {*}
 */
export const eventAction = (event, keyMap) => {
  let filters = getFilters(keyMap);

  let index = findIndex(filters, (filter) => {
    let verify = true;
    for (let filterKey in filter) {
      let value = filter[filterKey];
      if (value instanceof RegExp) verify = value.test(event.key);
      else verify = value === event[filterKey];

      if (verify === false) {
        return verify;
      }
    }
    return verify;
  });

  if (index !== -1) return keyMap[index].action;

  return false;
};
