import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { FeedbackRoutes } from '../modules/feedback/feedback.route';
import { InvoiceRoutes } from '../modules/invoice/invoice.route';
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
  {
    path: '/invoice',
    route: InvoiceRoutes,
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
