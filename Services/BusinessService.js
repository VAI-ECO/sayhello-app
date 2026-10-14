import requests from "./httpservice";

const BusinessService = {
  searchBusiness(name) {
    return requests.get(`api/v1/business/search/${name}`);
  },
  createBusiness(body) {
    return requests.post(`api/v1/business/create`, body);
  },
  getAllBusinessCategories() {
    return requests.get(`api/v1/businessCategories`);
  },
  updateBusinessCategory(id, body) {
    return requests.put(`api/v1/business/category/${id}`, body);
  },
  updateBussinessDetails(id, body) {
    return requests.put(`api/v1/business/update`, body);
  },
  updateBusinessDescription(id, body) {
    return requests.put(`api/v1/business/description/${id}`, body);
  },
  CreateBusinessService(id, body) {
    return requests.post(`api/v1/business/${id}/contacts`, body);
  },
  GetBusinessDetails(id) {
    return requests.get(`api/v1/business/${id}`);
  },
  GetBusinessDetailsVerify(id) {
    return requests.get(`api/v1/business/verify/${id}`);
  },
  UpdateBusinessHours(id, body) {
    return requests.put(`api/v1/business/hour/${id}`, body);
  },
  BusinessImages(id, body) {
    return requests.put(`api/v1/business/photo/${id}`, body);
  },
  BusinessSocial(id, body) {
    return requests.put(`api/v1/business/${id}/links/`, body);
  },
  assignBusiness(body) {
    return requests.post(`api/v1/business/assign-business`, body);
  },
  suggestBusinessAmbinsdaor(body) {
    return requests.post(`api/v1/business/suggest`, body);
  },
  uploadPhotoofBussiness(body) {
    return requests.post(`api/v1/business/uploadPhoto`, body);
  },
  subscribeBusiness(body) {
    return requests.post(`api/v1/business/subscribeBusiness`, body);
  },
  checkBusinessSubscription(id, body) {
    return requests.get(
      `api/v1/business/checkBusinessSubscription/${id}`,
      body
    );
  },
};

export default BusinessService;
