import requests from "./httpservice";

const OrganizationService = {
  createOrganization(body) {
    return requests.post(`api/v1/origination`, body);
  },
  createDescription(orgId, body) {
    return requests.put(`api/v1/origination/update/${orgId}`, body);
  },
  addGroupSocial(orgId, body) {
    return requests.put(`api/v1/origination/social/${orgId}`, body);
  },
  addGroupReview(orgId, body) {
    return requests.put(`api/v1/origination/review/${orgId}`, body);
  },
  getDetails(orgId, body) {
    return requests.get(`api/v1/origination/${orgId}`, body);
  },
  updateSummary(orgId, body) {
    return requests.put(`api/v1/origination/update/fields/${orgId}`, body);
  },
  assignUserID(body) {
    return requests.put(`api/v1/origination/assign-user`, body);
  },
  addPhotos(id, body) {
    return requests.put(`api/v1/origination/photos/${id}`, body);
  },
};

export default OrganizationService;
