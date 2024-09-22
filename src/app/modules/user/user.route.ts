import express from 'express';
import { USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router.get(
  '/my-profile',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.USER),
  UserController.getMyProfile
);

router.patch(
  '/my-profile',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.USER),
  UserController.updateMyProfile
);

router.get('/:id', auth(USER_ROLE.ADMIN), UserController.getSingleUser);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser
);

router.delete('/:id', auth(USER_ROLE.ADMIN), UserController.deleteUser);

router.get('/', auth(USER_ROLE.ADMIN), UserController.getAllUsers);

export const UserRoutes = router;
