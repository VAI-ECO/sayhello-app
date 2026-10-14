import ConnectionsLoader from "../Component/ConnectionsLoader";
import requests from "./httpservice";

const userService = {
  getUserById(id, body) {
    return requests.get(`api/v1/users/${id}/userById`, body);
  },
  saveBussinessIntreset(body) {
    return requests.post(`api/v1/users/saveinterestedInBusiness`, body);
  },
  saveDatingIntreset(body) {
    return requests.post(`api/v1/users/saveinterestedInDatting`, body);
  },
  saveBussinessDetails(body) {
    return requests.post(`api/v1/users/saveBusinessInfo`, body);
  },
  getUserConnections(id, body) {
    return requests.get(`api/v1/userConnection/${id}`, body);
  },
  getFilteredUsers(body) {
    return requests.post(`api/v1/users/getFilteredUsers`, body)
  },
  getUserBussinessDetails(id, body) {
    return requests.get(`api/v1/users/${id}/bussiness-info`, body);
  },
  getUserDatingDetails(id, body) {
    return requests.get(`api/v1/users/${id}/dating-info`, body);
  },
  updateUserQuestions(body) {
    return requests.put(`api/v1/personalQuestions/update`, body);
  },
  getUserSavedQuestions(id, body) {
    return requests.get(`api/v1/personalQuestions/${id}`, body);
  },
  updateUserGeneralNotification(id) {
    return requests.put(`api/v1/users/${id}/updateGeneralNotification`);
  },
  updateBussinessNotification(id) {
    return requests.put(`api/v1/users/${id}/updateBussinessNotification`);
  },
  updateDattingNotification(id) {
    return requests.put(`api/v1/users/${id}/updateDattingNotification`);
  },
  toggleIsAppearsNearby(data) {
    return requests.put(`api/v1/users/toggleIsAppearsNearby`, data);
  },
  attendUserMeetups(body) {
    return requests.post(`api/v1/users/saveMeetup`, body);
  },
  updateLanguage(id, body) {
    return requests.put(`api/v1/users/${id}/changelanguage`, body);
  },
  changePassword(body) {
    return requests.post(`api/v1/users/changepass`, body);
  },
  updateIsIntrestedInBussiness(id, body) {
    return requests.put(`api/v1/users/${id}/update/interestedInBusiness`, body);
  },
  updateBusinessQuestionsForEdit(id, body) {
    return requests.put(
      `api/v1/users/${id}/update/updateBusinessQuestions`,
      body
    );
  },
  markingAmbsidor(body) {
    return requests.post(`api/v1/users//markingAmbsidor`, body);
  },
  checkEmailExists(email, body) {
    return requests.get(`api/v1/users/check-email/${email}`, body);
  },
  checkPhoneNumberExists(phonenumber, body) {
    return requests.get(`api/v1/users/check-phonenumber/${phonenumber}`, body);
  },
  createPayment(body) {
    return requests.post(`api/v1/payment/create`, body);
  },
  createPostingPayment(body) {
    return requests.post(`api/v1/payment/createPostingPayment`, body);
  },
  getReferalRewards(id, body) {
    return requests.get(`api/v1/referral/referral-rewards/user/${id}`, body);
  },
  getUserRefereal(id, body) {
    return requests.get(`api/v1/users/referredUsers/${id}`, body);
  },
  // getNewReferalCodeGenrate(id, body) {
  //   return requests.get(`api/v1/users/assignReferalCode/${id}`, body);
  // },
  getNewReferalCodeGenrate(id, body) {
    return requests.post(`api/v1/users/assignReferalCode/${id}`, body);
  },
  sendAmbEmail(body) {
    return requests.post(`api/v1/users/sendAmbEmail`, body);
  },
  sendSMSTOBussiness(body) {
    return requests.post(`api/v1/users/sendAmbSMS`, body);
  },
  updateUserStatus(body) {
    return requests.post(`api/v1/users/update-user-status`, body);
  },
  updateUserPoints(id, points, body) {
    return requests.put(`api/v1/users/${id}/updateUserPoints/${points}`, body);
  },
  addDrawingEntries(id, entries, body) {
    return requests.put(`api/v1/users/${id}/drawing-entries/${entries}`, body);
  },
  getUserHomePoints(id, body) {
    return requests.get(`api/v1/users/homepoints/${id}`, body);
  },
  createBugReport(body) {
    return requests.post(`api/v1/bugreport/create`, body);
  },
  createFeedbackReport(body) {
    return requests.post(`api/v1/feedback/create`, body);
  },
  getIndividualRules(body) {
    return requests.get(`api/v1/rules/individual`, body);
  },
  shareAppPoints(id, body) {
    return requests.put(`api/v1/shareapppoints/${id}`, body);
  },
  emailForogotPass(body) {
    return requests.post(`api/v1/users/forgot-password/email`, body);
  },
  phoneForgotPassword(body) {
    return requests.post(`api/v1/users/forgot-password/phone`, body);
  },
  changePasswordForgot(body) {
    return requests.post(`api/v1/users/changepassForgot`, body);
  },
  homeAdvertisement(body) {
    return requests.get(`api/v1/advertisement/all`, body);
  },
  blockUserMsg(userConnectionId,body) {
    return requests.put(`/api/v1/chat/${userConnectionId}`,body);
  }
};

export default userService;
