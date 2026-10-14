import requests from "./httpservice";

const PostNotificationService = {
  createNotification(body) {
    return requests.post(`api/v1/postnotification/create`, body);
  },
  getNotificationByUserId(notificaionId, body) {
    return requests.get(`api/v1/postnotification/${notificaionId}`, body);
  },
  markAsComplete(notificaionId, body) {
    return requests.put(`api/v1/postnotification/${notificaionId}/isComplete`, body);
  },
};

export default PostNotificationService;
