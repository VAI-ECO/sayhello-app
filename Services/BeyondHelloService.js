import requests from "./httpservice";

const BeyondHelloService = {
  getAgencies(body) {
    return requests.get(`api/v1/agency/all`, body);
  },
};

export default BeyondHelloService;
