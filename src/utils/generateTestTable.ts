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

function createRow(item: OrderItem, yOffset: number): string {
  return `
    <g transform="translate(0, ${yOffset})">
      <rect x="19.208597" y="61.571621" width="171.58279" height="7.3518338" fill="none" stroke="black" stroke-width="0.199968"/>
      <text x="94.962776" y="66.835037" font-size="4.23333px">${item.description}</text>
      <image x="73.050186" y="63.902336" width="14.665393" height="2.9750347" href="${item.imageUrl}"/>
    </g>
  `;
}

function generateRows(items: OrderItem[]): string {
  return items.map((item, index) => createRow(item, index * 7.3237393)).join('');
}

export async function generateTestTable(data: OrderData): Promise<Buffer> {
  // Read the SVG template
  const template = await readFileAsync('src/templates/test-table-template.svg', 'utf8');
  const $ = cheerio.load(template, { xmlMode: true });

  // Generate table rows
  const tableContainer = $('#rows');
  tableContainer.empty(); // Remove any existing rows
  const newRows = generateRows(data.items);
  tableContainer.append(newRows);

  // Ensure the SVG is properly formatted
  const updatedSvg = $.xml();

  // Generate PDF
  const doc = new PDFDocument({ size: 'A4' });
  const pdfBuffer: Buffer[] = [];

  doc.on('data', pdfBuffer.push.bind(pdfBuffer));
  
  SVGtoPDF(doc, updatedSvg, 0, 0, {
    preserveAspectRatio: 'xMinYMin meet'
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(pdfBuffer));
    });
  });
}