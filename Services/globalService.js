import requests from "./httpservice";

const globalService = {
  grabHelloConnections(body) {
    return requests.get(`api/v1/connection/all`, body);
  },
  getSocials(body) {
    return requests.get(`api/v1/connection/all`, body);
  },

};

export default globalService;
