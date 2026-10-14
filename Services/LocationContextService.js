import requests from "./httpservice";

const LocationContextService = {
  SaveLocation(body) {
    requests.post(`api/v1/users/saveLocation`, body);
  },
  CheckNearby(user_id) {
    requests.get(`api/v1/users/${user_id}/nearby`);
  },
};

export default LocationContextService;
