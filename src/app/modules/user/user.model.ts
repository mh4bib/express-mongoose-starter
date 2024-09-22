import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import { userRole } from './user.constant';
import { IUser, UserModel } from './user.interface';
import config from '../../../config';

export const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    email: {
      type: String,
      unique:true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0
    },
    role: {
      type: String,
      enum: userRole,
      required: true,
      default: 'user',
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.statics.isUserExist = async function (
  email: string
): Promise<
  (Pick<IUser, 'role' | 'email' | 'password'> & { _id: any }) | null
> {
  return await User.findOne(
    { email },
    { _id: 1, role: 1, email: 1, password: 1 }
  );
};

UserSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

UserSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModel>('User', UserSchema);
