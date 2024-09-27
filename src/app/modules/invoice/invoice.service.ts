import { Response } from "express";
import { generateInvoice } from "../../../utils/generateInvoice";
import { generatePDFFromSVG } from "../../../utils/generatePdfFromSVG";

const dummyOrderData = {
  orderNumber: 'QZ39480',
  orderDate: '18/09/2024',
  soldTo: {
    name: 'John Doe',
    address: '123 Main St, Anytown',
    postalCode: '12345'
  },
  shipTo: {
    name: 'Jane Doe',
    address: '456 Elm St, Othertown',
    postalCode: '67890'
  },
  items: [
    {
      sku: 'A-03343-Royal Blue-54',
      description: 'Premium Layered Abaya',
      originalPrice: 198.00,
      afterDiscount: 89.00,
      quantity: 2,
      totalAmount: 178.00,
      imageUrl: 'src/assets/product-img.png'
    },
    {
      sku: 'A-03343-Royal Blue-54',
      description: 'Premium Layered Abaya',
      originalPrice: 198.00,
      afterDiscount: 89.00,
      quantity: 2,
      totalAmount: 178.00,
      imageUrl: 'src/assets/product-img.png'
    }
  ],
  originalPrice: 999.00,
  afterDiscount: 888.00,
  vat: 0.00,
  shippingHandling: 0.00,
  grandTotal: 888.00
};

const getInvoice = async (res: Response): Promise<any> => {
  try {
    generateInvoice(res, dummyOrderData);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

const getInvoiceFromSvg = async (res: Response): Promise<any> => {
  try {
    const pdfBuffer = await generatePDFFromSVG(dummyOrderData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
}

export const InvoiceService = {
  getInvoice,
  getInvoiceFromSvg
};
