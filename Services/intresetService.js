import requests from "./httpservice";

const intresetService = {
  getIntresets(body) {
    return requests.get(`api/v1/intrest/all`, body);
  },
  SaveIntreset(body) {
    return requests.post(`api/v1/users/saveIntreset`, body);
  },

  CreateIntrest(body) {
    return requests.post(`api/v1/intrest/create`, body);
  },

  GetSubGender(name) {
    console.log("name", name);
    return requests.get(`api/v1/genderGlobal/${name}`);
  },
};

export default intresetService;
