import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { FeedbackRoutes } from '../modules/feedback/feedback.route';
import { OtpRoutes } from '../modules/otp/otp.route';
import { UserRoutes } from '../modules/user/user.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/reset-password',
    route: OtpRoutes,
  },
  {
    path: '/feedback',
    route: FeedbackRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
