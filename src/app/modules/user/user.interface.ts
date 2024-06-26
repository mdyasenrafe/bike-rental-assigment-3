import { UserRolesObject } from "./user.constant";

export type TUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: "admin" | "user";
};

export type TUserRoles = keyof typeof UserRolesObject;
