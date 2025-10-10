import axios from "axios";

const enfermeraFirmante = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/enfermeras-firmantes`,
});

export default enfermeraFirmante;
