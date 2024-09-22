import { z } from 'zod';
import { userRole } from './user.constant';

const updateUserZodSchema = z.object({
  body: z.object({
    password: z.string().optional(),
    name: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
      .optional(),
    email: z.string().email({message:'Invalid email'}).optional(),
    role: z.enum([...userRole] as [string, ...string[]]).optional(),
    address: z.string().optional(),
  }),
});

export const UserValidation = {
  updateUserZodSchema,
};
