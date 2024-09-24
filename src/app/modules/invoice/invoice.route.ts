import express from 'express';
import { InvoiceController } from './invoice.controller';
const router = express.Router();


router.get(
  '/',
  InvoiceController.getInvoicePdf
);


router.get(
  '/test',
  InvoiceController.getTestPdf
);

export const InvoiceRoutes = router;
