/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IUserRole = 'super_admin' | 'admin' | 'user';

export type UserName = {
  firstName: string;
  lastName: string;
};

export type IUser = {
  email: string;
  role: IUserRole;
  password: string;
  name: UserName;
  address: string;
};

export type UserModel = {
  isUserExist(
    email: string
  ): Promise<
    (Pick<IUser, 'role' | 'email' | 'password'> & { _id: any }) | null
  >;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IUser>;
