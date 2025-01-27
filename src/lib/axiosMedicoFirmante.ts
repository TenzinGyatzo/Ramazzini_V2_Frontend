import axios from "axios";

const medicoFirmante = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/medicos-firmantes`,
});

export default medicoFirmante;
