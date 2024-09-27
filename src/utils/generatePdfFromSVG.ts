import * as cheerio from 'cheerio';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { promisify } from 'util';


const readFileAsync = promisify(fs.readFile);

type OrderItem = {
  sku: string;
  description: string;
  originalPrice: number;
  afterDiscount: number;
  quantity: number;
  totalAmount: number;
  imageUrl: string;
}

type OrderData = {
  orderNumber: string;
  orderDate: string;
  soldTo: {
    name: string;
    address: string;
    postalCode: string;
  };
  shipTo: {
    name: string;
    address: string;
    postalCode: string;
  };
  items: OrderItem[];
  originalPrice: number;
  afterDiscount: number;
  vat: number;
  shippingHandling: number;
  grandTotal: number;
}

export async function generatePDFFromSVG(data: OrderData): Promise<Buffer> {
  // Read the SVG template
  const template = await readFileAsync('src/templates/office21-invoice-v1.svg', 'utf8');
  // console.log(template);
  const $ = cheerio.load(template);

  // Update the SVG with the provided data
  $('#orderNumber').text(data.orderNumber);
  $('#orderDate').text(data.orderDate);
  $('#soldToName').text(data.soldTo.name);
  $('#soldToAddress').text(data.soldTo.address);
  $('#soldToPostcode').text(data.soldTo.postalCode);
  $('#shipToName').text(data.shipTo.name);
  $('#shipToAddress').text(data.shipTo.address);
  $('#shipToPostcode').text(data.shipTo.postalCode);

  // Update totals
  $('#originalPrice').text(data.originalPrice.toFixed(2));
  $('#afterDiscount').text(data.afterDiscount.toFixed(2));
  $('#vat').text(data.vat.toFixed(2));
  $('#shippingHandling').text(data.shippingHandling.toFixed(2));
  $('#grandTotal').text(data.grandTotal.toFixed(2));

  // Generate PDF
  const doc = new PDFDocument({ size: 'A4' });
  const pdfBuffer: Buffer[] = [];

  doc.on('data', pdfBuffer.push.bind(pdfBuffer));
  
  SVGtoPDF(doc, $('body').html(), 0, 0, {
    preserveAspectRatio: 'xMinYMin meet'
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(pdfBuffer));
    });
  });
}