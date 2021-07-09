const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const api = axios.create({
  baseURL: "https://api.zoom.us/v2/",
  headers: {
    "Content-Type": "application/json",
  },
});
/**
 * console.log all requests and responses
 */
api.interceptors.request.use(
  (request) => {
    const payload = {
      iss: process.env.API_KEY,
      exp: new Date().getTime() + 10000,
    };
    const token = jwt.sign(payload, process.env.API_SECRET);
    request.headers.authorization = "Bearer " + token;
    console.log("Starting Request", request);

    return request;
  },
  function (error) {
    console.log("REQUEST ERROR", error);
  }
);

api.interceptors.response.use(
  (response) => {
    // console.log("Response:", response);
    return response;
  },
  function (error) {
    error = error.response.data;
    console.log("RESPONSE ERROR", error);
    let errorMsg = error.message || "";
    if (error.errors && error.errors.message)
      errorMsg = errorMsg + ": " + error.errors.message;
    return Promise.reject(error);
  }
);

module.exports = api;
