import axios from "axios";

const tecnicoFirmante = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/tecnicos-firmantes`,
});

export default tecnicoFirmante;


