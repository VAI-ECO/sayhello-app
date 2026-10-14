import requests from "./httpservice";

const DiscountService = {
  createDiscount(body) {
    return requests.post(`api/v1/postdiscount/create`, body);
  },
  updateDiscountTime(discountId, body) {
    return requests.put(`api/v1/postdiscount/update-dates/${discountId}`, body);
  },
  updateDiscountImage(discountId, body) {
    return requests.put(
      `api/v1/postdiscount/update-image-status/${discountId}`,
      body
    );
  },
  getDetails(discountId, body) {
    return requests.get(`api/v1/postdiscount/details/${discountId}`, body);
  },
  markAsCompleted(discountId) {
    return requests.put(`api/v1/postdiscount/${discountId}/complete`);
  },
  markAsSubscribed(discountId) {
    return requests.put(`api/v1/postdiscount/${discountId}/isSubscribe`);
  },
  getDiscountByUserId(discountId, body) {
    return requests.get(`api/v1/postdiscount/${discountId}`, body);
  },
};

export default DiscountService;
