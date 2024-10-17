import useAxios from "@/hooks/useAxios";
import { UserRegister } from "@/types/Auth";

export class Private {
  handleGetAllUser = async () => {
    const axiosPrivate = useAxios();
    return await axiosPrivate.get("/users");
  };

  handleRegisterUser = async (data: UserRegister) => {
    const axiosPrivate = useAxios();
    return await axiosPrivate.post("/users", data);
  };
}

export const userService = new Private();
