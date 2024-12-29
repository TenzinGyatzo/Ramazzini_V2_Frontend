import axios from "axios";

const auth = axios.create({
  baseURL: "http://localhost:3000/auth",
});

export default auth;
