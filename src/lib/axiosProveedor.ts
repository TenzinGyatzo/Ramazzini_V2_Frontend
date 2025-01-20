import axios from "axios";

const proveedor = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/proveedores-salud`,
});

export default proveedor;
