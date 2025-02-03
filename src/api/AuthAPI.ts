import auth from "@/lib/axiosAuth";

export default {
  login: (email: string, password: string) => {
    return auth.post("/users/login", { email, password });
  },

  auth: () => {
    const token = localStorage.getItem("AUTH_TOKEN");
    return auth.get("/users/user", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
  },

  registerUser(userData) {
    return auth.post("/users/register", userData);
  },
};
