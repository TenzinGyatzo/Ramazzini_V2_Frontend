import axios from "axios";

const informes = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/informes`,
});

export default informes;
