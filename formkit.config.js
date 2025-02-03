import { generateClasses } from "@formkit/themes";

const rfcValidation = ({ value }) => {
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{2}\d{2}\d{2}[A-Z\d]{3}$/;
  return rfcRegex.test(value.trim());
};
const postalCodeValidation = ({ value }) => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(value.trim());
};
const phoneValidation = ({ value }) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(value.trim());
};
const mailValidation = ({ value }) => {
  const mailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return mailRegex.test(value.trim());
};
const urlValidation = ({ value }) => {
  const urlRegex = /^(?![.-])(?!.*[.-]{2})(?=.*\.)[a-zA-Z0-9.-]+(?<![.-])$/;
  return urlRegex.test(value.trim());
};
const cedulaProfesionalValidation = ({ value }) => {
  const cedulaNumberRegex = /^[0-9]{6,8}$/;
  return cedulaNumberRegex.test(value.trim());
};
const cedulaEspecialistaValidation = ({ value }) => {
  const cedulaNumberRegex = /^[0-9]{7,8}$/;
  return cedulaNumberRegex.test(value.trim());
};
const emailValidation = ({ value }) => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(value.trim());
};
const passwordValidation = ({ value }) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(value.trim());
};


const config = {
  config: {
    classes: generateClasses({
      global: {
        wrapper: "space-y-1 mb-1",
        message: "text-red-700 text-sm mb-3",
        label: "block mt-4 font-medium text-lg text-gray-700",
        input:
         "w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
      },
      submit: {
        input:
          "$reset text-lg bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-normal w-full p-3 transition-transform transform hover:scale-105 shadow-md m-0",
      },
      file: {
        input:
          "block w-full p-3 border-2 border-dashed hover:border-emerald-500 rounded-lg cursor-pointer text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 file:cursor-pointer file:bg-emerald-500 file:text-white file:font-normal file:py-2 file:px-4 file:rounded-full file:border-none hover:file:bg-emerald-600 transition-colors duration-200 ease-in-out",
      },
    }),
    validationRules: {
      rfcValidation,
      postalCodeValidation,
      phoneValidation,
      mailValidation,
      urlValidation,
      emailValidation,
      passwordValidation,
      cedulaProfesionalValidation,
      cedulaEspecialistaValidation,
    },
  },
};

export default config;
