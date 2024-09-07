import { UserRolesObject } from "./user.constant";

export type TUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: "admin" | "user";
  status: "active" | "deleted";
};

export type TUserRoles = keyof typeof UserRolesObject;
