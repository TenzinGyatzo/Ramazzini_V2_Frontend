import axios from "axios";

const rt = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/riesgos-trabajo`,
});

export default rt;
  