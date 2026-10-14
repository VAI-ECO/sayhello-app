import requests from "./httpservice";

const HoostaService = {
  createHoosta(body) {
    return requests.post(`api/v1/hoosta/create`, body);
  },
  updateHoostaLocation(hoostaId, body) {
    return requests.put(`api/v1/hoosta/update-location/${hoostaId}`, body);
  },
  updateDescription(hoostaId, body) {
    return requests.put(`api/v1/hoosta/update-description/${hoostaId}`, body);
  },
  updateContact(hoostaId, body) {
    return requests.put(`api/v1/hoosta/update-contact/${hoostaId}`, body);
  },
  getDetails(hoostaId, body) {
    return requests.get(`api/v1/hoosta/details/${hoostaId}`, body);
  },
  markAsCompleted(hoostaId) {
    return requests.put(`api/v1/hoosta/${hoostaId}/complete`);
  },
  markAsSubscribed(hoostaId) {
    return requests.put(`api/v1/hoosta/${hoostaId}/isSubscribe`);
  },
  getHoostaByUserId(hoostaId, body) {
    return requests.get(`api/v1/hoosta/${hoostaId}`, body);
  },
  hoostaImages(id, body) {
    return requests.put(`api/v1/hoosta/addPhotos/${id}`, body);
  },
  addHosstaAttende(body) {
    return requests.post(`api/v1/hoosta/addattendee`, body);
  },
  addlikeEvent(body) {
    return requests.post(`api/v1/hoosta/tooglelike`, body);
  },
};

export default HoostaService;
