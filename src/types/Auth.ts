import { UserModel } from "./User";

export interface LoginForm {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  phoneNumber: string;
  fullName: string;
  password: string;
}

export interface AuthData {
  accessToken: string;
  account: UserModel;
}
