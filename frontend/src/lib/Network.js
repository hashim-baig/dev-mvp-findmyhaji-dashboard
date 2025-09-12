import axios from 'axios';

const isTokenExpire = () => {
    const itemStr = localStorage.getItem('findmyhaji_token');
    if (!itemStr) return true;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
        localStorage.removeItem('token');
        window.location.href = "/login";
        return true;
    }
    return false;
}
const checkExist = () => {
    return localStorage.getItem('findmyhaji_token') ? true :false;
}
const updateExpiryToken = () => {
    const itemStr = localStorage.getItem('findmyhaji_token');
    const item = itemStr;
    const now = new Date();
    const fourHoursInMs = 4 * 60 * 60 * 1000;//4 hour
    const updatedItem = {
        token: item,
        expiry: now.getTime() + fourHoursInMs, // ttl in milliseconds
    };
    localStorage.removeItem('findmyhaji_token');
    localStorage.setItem('findmyhaji_token',JSON.stringify(updatedItem));
}


const Network = {
  get: (url, headers = {}) => {
    return axios.get(url, { headers })
      .then((response) => response)
      .catch((error) => error);
  },
  post: (url, headerData, parameters) => {
        if(checkExist()){
            updateExpiryToken();
        }
        return axios.create({
            baseURL: url,
            headerData,
        }).post(url,parameters)
                  .then(function (response) { return response })
                  .catch(function (error) {
                    if (error.response) {
                    return error.response;
                    }
                    return { error: error };
                });
      
  }
   
};

export default Network;