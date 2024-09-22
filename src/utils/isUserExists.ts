/* eslint-disable @typescript-eslint/no-explicit-any */

export const isUserExist = async function (email: string, UserDb: any) {
  return await UserDb.findOne(
    { email },
    { _id: 1, password: 1, role: 1, email: 1, organization_id: 1 }
  ).lean();
};
