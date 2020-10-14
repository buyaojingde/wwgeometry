export default {
  getCookie(c_name) {
    if (document.cookie.length > 0) {
      let c_start = document.cookie.indexOf(c_name + '=');
      if (c_start !== -1) {
        c_start = c_start + c_name.length + 1;
        let c_end = document.cookie.indexOf(';', c_start);
        if (c_end === -1) {
          c_end = document.cookie.length;
        }
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return null;
  },
  setCookie(c_name, value, expiredays, domain) {
    const exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie =
      c_name +
      '=' +
      escape(value) +
      (domain ? `;domain=${domain}` : '') +
      (expiredays == null ? '' : ';expires=' + exdate.toGMTString()) +
      ';path=/';
  },
  delCookie(c_name, domain) {
    const exdate = new Date();
    document.cookie =
      c_name + '=' + (domain ? `;domain=${domain}` : '') + (';expires=' + exdate.toGMTString()) + ';path=/';
  },
};
