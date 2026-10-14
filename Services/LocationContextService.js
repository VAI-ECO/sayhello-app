import requests from "./httpservice";

const LocationContextService = {
  SaveLocation(body) {
    return requests.post(`api/v1/users/saveLocation`, body);
  },
  CheckNearby(user_id) {
    return requests.get(`api/v1/users/${user_id}/nearby`);
  },
};

export default LocationContextService;
