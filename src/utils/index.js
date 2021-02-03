/* eslint-disable no-extra-boolean-cast */
/**
 * 判断用户操作系统
 * @returns {string}
 */
export const validataOS = (function () {
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
