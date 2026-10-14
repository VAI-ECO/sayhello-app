import requests from "./httpservice";

const meetupService = {
  getUserMeetups(id, body) {
    return requests.get(`api/v1/meetup/user/${id}`, body);
  },
  createPartialEvent(body) {
    return requests.post(`api/v1/meetup/create-partial`, body);
  },
  addDate(body) {
    return requests.post(`api/v1/meetup/add-date`, body);
  },
  addTime(body) {
    return requests.post(`api/v1/meetup/add-time`, body);
  },
  addAddress(body) {
    return requests.post(`api/v1/meetup/add-address`, body);
  },
  addDescription(body) {
    return requests.post(`api/v1/meetup/add-description`, body);
  },
  addPhotos(body) {
    return requests.post(`api/v1/meetup/add-photos`, body);
  },
  addOrganization(body) {
    return requests.post(`api/v1/meetup/add-organization`, body);
  },
  getMeetUpByIds(id) {
    return requests.get(`api/v1/meetup/${id}`);
  },
  getMeetUpById(id) {
    return requests.get(`api/v1/meetup/${id}/events`);
  },
  saveMeetupinWhats(body) {
    return requests.post(`api/v1/whatshappening/saveMeet`, body);
  },
  deleteMeetup(id) {
    return requests.delete(`api/v1/meetup/${id}`);
  },
  checkIsEventAdmin(userId, eventId) {
    return requests.get(`api/v1/meetup/${userId}/${eventId}/isadmin`);
  },
  addlikeEvent(eventId, userId, body) {
    return requests.post(`api/v1/meetup/${eventId}/likes/${userId}`, body);
  },
  attendEvent(eventId, userId, body) {
    return requests.post(`api/v1/meetup/${eventId}/attendees/${userId}`, body);
  },
  updateMeetupdescandname(id,body) {
    return requests.put(`api/v1/meetup/updatdescandname/${id}`, body);
  },
};

export default meetupService;
