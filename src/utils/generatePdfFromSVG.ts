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
     id="g492"
     inkscape:label="row"
     transform="translate(0, ${yOffset})">
     <text
   xml:space="preserve"
   transform="matrix(0.26371799,0,0,0.26458786,0.34274223,-0.00188809)"
   id="text462"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:14.6667px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;writing-mode:lr-tb;white-space:pre;shape-inside:url(#rect494);display:inline;fill:#1a1a1a;stroke:none;stroke-width:1.51181;stroke-dasharray:none;stroke-opacity:1"
   inkscape:label="skuSizeColor"><tspan
     x="50.832031"
     y="400.8976"
     id="tspan774">dfasdfasdfasdf</tspan><tspan
     x="50.832031"
     y="419.23098"
     id="tspan776">asdfasdfasdfas</tspan><tspan
     x="50.832031"
     y="437.56435"
     id="tspan778">dfsdafasdfas</tspan></text><text
   xml:space="preserve"
   transform="matrix(0.26371799,0,0,0.26458786,0.34274223,-0.00188809)"
   id="text470"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:14.6667px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;writing-mode:lr-tb;white-space:pre;shape-inside:url(#rect496);display:inline;fill:#1a1a1a;stroke:none;stroke-width:1.51181;stroke-dasharray:none;stroke-opacity:1"
   inkscape:label="description"><tspan
     x="168.79297"
     y="399.62221"
     id="tspan780">ddddddddfa</tspan><tspan
     x="168.79297"
     y="417.95558"
     id="tspan782">sdfsdafasdf </tspan><tspan
     x="168.79297"
     y="436.28896"
     id="tspan784">dfasdfasdf</tspan></text>
     
     

   <text
   xml:space="preserve"
   transform="matrix(0.26371799,0,0,0.26458786,-27.703103,-0.00188809)"
   id="text476"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:14.6667px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;white-space:pre;shape-inside:url(#rect498);shape-padding:0.0492581;display:inline;fill:#1a1a1a;stroke:none;stroke-width:1.51181;stroke-dasharray:none;stroke-opacity:1"
   inkscape:label="originalPrice"><tspan
     x="477.51442"
     y="422.04604"
     id="tspan786">${item.originalPrice.toFixed(2)}</tspan></text><text
   xml:space="preserve"
   transform="matrix(0.26371799,0,0,0.26458786,0.34274223,-0.00188809)"
   id="text480"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:14.6667px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;white-space:pre;shape-inside:url(#rect500);display:inline;fill:#1a1a1a;stroke:none;stroke-width:1.51181;stroke-dasharray:none;stroke-opacity:1"
   inkscape:label="afterDiscount"><tspan
     x="474.47007"
     y="421.99721"
     id="tspan788">${item.afterDiscount.toFixed(2)}</tspan></text><text
   xml:space="preserve"
   transform="matrix(0.26371799,0,0,0.26458786,0.34274223,-0.00188809)"
   id="text484"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:14.6667px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:center;writing-mode:lr-tb;white-space:pre;shape-inside:url(#rect502);display:inline;fill:#1a1a1a;stroke:none;stroke-width:1.51181;stroke-dasharray:none;stroke-opacity:1"
   x="-24.522717"
   y="0"
   inkscape:label="quantity"><tspan
     x="575.49897"
     y="422.28627"
     id="tspan790">${item.quantity}</tspan></text><text
   xml:space="preserve"
   transform="matrix(0.26371799,0,0,0.26458786,0.34274223,-0.00188809)"
   id="text488"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:14.6667px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;white-space:pre;shape-inside:url(#rect504);display:inline;fill:#1a1a1a;stroke:none;stroke-width:1.51181;stroke-dasharray:none;stroke-opacity:1"
   x="43.347439"
   y="0"
   inkscape:label="totalAmount"><tspan
     x="657.86978"
     y="422.40737"
     id="tspan792">${item.totalAmount.toFixed(2)}</tspan></text><path
   id="path490"
   style="display:inline;fill:none;stroke:#6e7a7c;stroke-width:0.399413;stroke-dasharray:none;stroke-opacity:1"
   d="M 166.95167,101.15196 V 119.9991 M 145.85414,101.15196 V 119.9991 M 114.73527,101.15196 V 119.9991 M 85.726212,101.15196 V 119.9991 M 68.848273,101.15196 V 119.9991 M 43.531366,101.15196 v 18.84701 M 12.383494,101.04692 H 197.26903 V 119.9991 H 12.383494 Z"
   inkscape:label="border" /></g>
  `;
}

function generateRows(items: OrderItem[]): string {
  return items.map((item, index) => createRow(item, index * 18.84714)).join('');
}

export async function generatePDFFromSVG(data: OrderData): Promise<Buffer> {
  // Read the SVG template
  const template = await readFileAsync('src/templates/office21-invoice-v2.2.svg', 'utf8');
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