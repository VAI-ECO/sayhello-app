import requests from "./httpservice";

const AuthServices = {
  Login(body) {
    return requests.post("api/v1/users/login", body);
  },
  IndividualSignUp(body) {
    return requests.post("api/v1/users/create", body);
  },
  SignUp(body) {
    return requests.post(`api/v1/users/create`, body);
  },
  SignIn(body) {
    return requests.post(`api/v1/users/login`, body);
  },
  VerifyPhone(body) {
    return requests.post(`api/v1/users/verifyPhone`, body);
  },
  ResendSms(body) {
    return requests.post(`api/v1/users/resendSms`, body);
  },
  ResetPass(body) {
    return requests.post(`api/v1/users/resetPass`, body);
  },
  SavePersonalInfo(body) {
    return requests.post(`api/v1/users/savePersonalInfo`, body);
  },
  updatePersonalInfor(userId, body) {
    return requests.put(`api/v1/users/${userId}/updatepersonalInfo`, body);
  },
  SaveBusinessInfo(body) {
    return requests.post(`api/v1/users/saveBusinessInfo`, body);
  },
  SaveLocation(body) {
    return requests.post(`api/v1/users/saveLocation`, body);
  },
  SaveDatingInfo(body) {
    return requests.post(`api/v1/users/saveDatingInfo`, body);
  },
  SaveNotification(user_id, body) {
    return requests.put(`api/v1/users/${user_id}/notification-token`, body);
  },
  DeleteAccount(body) {
    return requests.post(`api/v1/users/delete-Account`, body);
  },
  updateProfile(userId, body) {
    return requests.put(`api/v1/users/${userId}/updateProfile`, body);
  },
  getUserById(userId) {
    return requests.get(`api/v1/users/${userId}/userById`);
  }
};

export default AuthServices;
