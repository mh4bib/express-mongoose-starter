import { Response } from "express";
import { generateInvoice } from "../../../utils/generateInvoice";

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
      imageUrl: 'src/assets/barcode.png'
    },
    {
      sku: 'A-03343-Royal Blue-54',
      description: 'Premium Layered Abaya',
      originalPrice: 198.00,
      afterDiscount: 89.00,
      quantity: 2,
      totalAmount: 178.00,
      imageUrl: 'src/assets/barcode.png'
    }
  ],
  originalPrice: 396.00,
  afterDiscount: 178.00,
  vat: 0.00,
  shippingHandling: 0.00,
  grandTotal: 178.00
};

const getInvoice = async (res: Response): Promise<any> => {
  try {
    generateInvoice(res, dummyOrderData);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

export const InvoiceService = {
  getInvoice,
};
