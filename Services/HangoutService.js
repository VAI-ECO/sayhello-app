import requests from "./httpservice";

const HangoutService = {
  createBasicInfor(body) {
    return requests.post(`api/v1/hangout/createhangout`, body);
  },
  createCategory(id, body) {
    return requests.post(`api/v1/hangout/${id}/category`, body);
  },
  createDescription(id, body) {
    return requests.post(`api/v1/hangout/${id}/desc`, body);
  },
  createPics(id, body) {
    return requests.post(`api/v1/hangout/${id}/pics`, body);
  },
  getDetails(id, body) {
    return requests.get(`api/v1/hangout/${id}`, body);
  },
  getAllHangouts(body) {
    return requests.get(`api/v1/hangout/all`, body);
  },

};

export default HangoutService;
