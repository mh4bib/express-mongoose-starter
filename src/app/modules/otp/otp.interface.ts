import { Model } from 'mongoose';

export type IOtp = {
  email: string;
  otp: string;
  isVerified: boolean;
  expiresAt: Date;
};

export type OtpModel = Model<IOtp, Record<string, unknown>>;
