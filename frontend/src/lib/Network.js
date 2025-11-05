import axios from 'axios';
import { Urls } from './utils';

const isTokenExpire = () => {
    const token = localStorage.getItem('findmyhaji_token');
    const expiry = localStorage.getItem('findmyhaji_token_expiry');

    if (!token || !expiry || Date.now() > Number(expiry)) {
      localStorage.removeItem('findmyhaji_token');
      localStorage.removeItem('findmyhaji_token_expiry');
      localStorage.removeItem('findmyhaji_user');
      window.location.href = "/login";
    }else{
        return false;
    }
    
}
// const checkExist = () => {
//     return localStorage.getItem('findmyhaji_token') ? true :false;
// }
// const updateExpiryToken = () => {
//     const itemStr = localStorage.getItem('findmyhaji_token');
//     const item = itemStr;
//     const now = new Date();
//     const fourHoursInMs = 4 * 60 * 60 * 1000;//4 hour
//     const updatedItem = {
//         token: item,
//         expiry: now.getTime() + fourHoursInMs, // ttl in milliseconds
//     };
//     localStorage.removeItem('findmyhaji_token');
//     localStorage.setItem('findmyhaji_token',JSON.stringify(updatedItem));
// }


const Network = {
  get: (url, headers = {}) => {
    isTokenExpire();
    return axios.get(url, { headers })
      .then((response) => response)
      .catch((error) => error);
  },
  post: (path, headers, parameters) => {
    if(!path.includes('login')){
        isTokenExpire();
    }
    return axios.create({
        baseURL: path,
        headers,
    }).post(path,parameters)
              .then(function (response) { return response })
              .catch(function (error) {
                if (error.response) {
                return error.response;
                }
                return { error: error };
            });
      
  },
  put: (path, headers, parameters) => {
    isTokenExpire();
    return axios.create({
      baseURL: Urls.baseUrl+path,
      headers,
    })
      .put(Urls.baseUrl+path, parameters)
      .then(response => response)
      .catch(error => {
        if (error.response) {
          return error.response;
        }
        return { error };
      });
  },
  delete: (url, headers) => {
    isTokenExpire();
    return axios.delete(url, { headers })
      .then((response) => response)
      .catch(error => {
        if (error.response) {
          return error.response;
        }
        return { error };
      });
  }
};
const NetworkFront = {
  get: (url, headers = {}) => {
    return axios.get(url, { headers })
      .then((response) => response)
      .catch((error) => error);
  },
  post: (path, headers, parameters) => {
    // if(!path.includes('login')){
    //     isTokenExpire();
    // }
    return axios.create({
        baseURL: path,
        headers,
    }).post(path,parameters)
              .then(function (response) { return response })
              .catch(function (error) {
                if (error.response) {
                return error.response;
                }
                return { error: error };
            });
      
  },
  put: (path, headers, parameters) => {
    // isTokenExpire();
    return axios.create({
      baseURL: Urls.baseUrl+path,
      headers,
    })
      .put(Urls.baseUrl+path, parameters)
      .then(response => response)
      .catch(error => {
        if (error.response) {
          return error.response;
        }
        return { error };
      });
  },
  delete: (url, headers) => {
    // isTokenExpire();
    return axios.delete(url, { headers })
      .then((response) => response)
      .catch(error => {
        if (error.response) {
          return error.response;
        }
        return { error };
      });
  }
};

export default Network;
export {NetworkFront};