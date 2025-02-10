import axios from "axios";

const pagos = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/pagos`,
});

export default pagos;
