import requests from "./httpservice";

const GroupService = {
  createGroup(body) {
    return requests.post(`api/v1/group`, body);
  },
  createDescription(orgId, body) {
    console.log("orgId",orgId)
    return requests.put(`api/v1/group/update/${orgId}`, body);
  },
  addGroupSocial(orgId, body) {
    return requests.put(`api/v1/group/social/${orgId}`, body);
  },
  getDetails(orgId, body) {
    return requests.get(`api/v1/group/${orgId}`, body);
  },
  updateSummarys(orgId, body) {
    return requests.put(`api/v1/group/update/fields/${orgId}`, body);
  },
  assignUserID(body) {
    return requests.put(`api/v1/group/assign-user`, body);
  },
  addPhotos(orgId, body) {
    return requests.put(`api/v1/group/photos/${orgId}`, body);
  },
};

export default GroupService;
