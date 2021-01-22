import axios from 'axios';

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config: any) => {
    // do something before request is sent
    config.headers['source'] = 'bim_route';
    return config;
  },
  (error: any) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  async (response: any) => {
    try {
      const res = response.data;

      // if the custom code is not 20000, it is judged as an error.
      if (
        res.code === 0 ||
        (response.config.codes &&
          response.config.codes.includes(String(res.code)))
      ) {
        return res;
      } else {
        console.error(res.code);
        return Promise.reject(new Error(res.msg || res.message || 'Error'));
      }
    } catch (error) {
      return response;
    }
  },
  (error: any) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default service;
