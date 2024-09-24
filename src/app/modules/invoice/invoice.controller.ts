import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { generatePdf } from '../../../utils/generatePdf';
import { InvoiceService } from './invoice.service';

const getTestPdf = catchAsync(async (req: Request, res: Response) => {
  try {
    const testData = {
      templateName: "test",
      data: {
        invoiceNumber: "INV-001",
        date: "2023-05-01",
        items: [
          { description: "Item 1", quantity: 2, price: 10, total: 20 },
          { description: "Item 2", quantity: 1, price: 15, total: 15 }
        ],
        totalAmount: 35
      },
      options: {
        format: 'A4',
        orientation: "portrait"
      }
    };

    const pdf = await generatePdf(testData.templateName, testData.data, testData.options);

    console.log('Generated PDF:', pdf);
    if (!pdf || pdf.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Content-Disposition', `attachment; filename=something.pdf`);
    res.send(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `An error occurred while generating the PDF: ${error.message}` });
    } else {
      res.status(500).json({ error: 'An unknown error occurred while generating the PDF' });
    }
  }
});

const getInvoicePdf = catchAsync(async (req: Request, res: Response) => {
    await InvoiceService.getInvoice(res);
});

export const InvoiceController = {
  getTestPdf,
  getInvoicePdf,
};