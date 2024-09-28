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
      <g
           transform="translate(0,${yOffset})"
           inkscape:label="row2">
           <text
            xml:space="preserve"
            style="font-size:4.23333px;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';fill:none;stroke:#000000;stroke-width:0.2;stroke-dasharray:none;stroke-opacity:1"
            x="94.962776"
            y="66.835037"
            id="text2476"><tspan
              sodipodi:role="line"
              id="tspan2474"
              style="fill:#000000;stroke:none;stroke-width:0.2"
              x="94.962776"
              y="66.835037">${item.sku}</tspan></text>
          <rect
             style="fill:none;stroke:#000000;stroke-width:0.199968;stroke-dasharray:none;stroke-opacity:1"
             width="171.58279"
             height="7.3518338"
             x="19.208597"
             y="61.571621" />
        </g>
    `;
  }  

function generateRows(items: OrderItem[]): string {
  return items.map((item, index) => createRow(item, index * 7.3237393)).join('');
}

export async function generateTestTable(data: OrderData): Promise<Buffer> {
  // Read the SVG template
  const template = await readFileAsync('src/templates/test-table.svg', 'utf8');
  // console.log(template);
  const $ = cheerio.load(template);

  // Generate table rows
  const tableContainer = $('#rows');
  // tableContainer.empty(); // Remove any existing rows
  const newRows = generateRows(data.items);
  tableContainer.append(newRows);

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