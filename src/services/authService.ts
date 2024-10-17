import useAxios from "@/hooks/useAxios";
import { LoginForm } from "../types/Auth";

export class Private {
  handleLogin = async (data: LoginForm) => {
    const axiosPrivate = useAxios();
    return await axiosPrivate.post("/auth", data);
  };

  handleGetUserLogin = async () => {
    const axiosPrivate = useAxios();
    return await axiosPrivate.get("/auth");
  };
}

export const authService = new Private();
