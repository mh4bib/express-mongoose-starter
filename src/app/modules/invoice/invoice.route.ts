import express from 'express';
import { InvoiceController } from './invoice.controller';
const router = express.Router();


router.get(
  '/',
  InvoiceController.getInvoicePdf
);

router.get(
  '/from-svg',
  InvoiceController.getInvoiceFromSvg
)

export const InvoiceRoutes = router;
