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
function wrapText(
  text: string,
  maxCharPerLine: number,
  maxLine: number,
  xOffset: number
): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  let lineCount = 0;

  // Create lines by wrapping text
  for (const word of words) {
    if ((currentLine + word).length > maxCharPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
      lineCount++;
      if (lineCount >= maxLine) {
        break;
      }
    } else {
      currentLine += word + ' ';
    }
  }

  // Add remaining text to the last line
  if (lineCount < maxLine) {
    lines.push(currentLine.trim());
  }

  // Handle ellipsis for overflowing text
  if (lines.length > maxLine) {
    lines.length = maxLine;
    lines[maxLine - 1] = lines[maxLine - 1].slice(0, maxCharPerLine - 3).trim() + '...';
  } else if (lines[lines.length - 1].length > maxCharPerLine) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, maxCharPerLine - 3).trim() + '...';
  }

  if (lines.length === maxLine && currentLine.length > 0 && lines[maxLine - 1].length >= maxCharPerLine) {
    lines[maxLine - 1] = lines[maxLine - 1].slice(0, maxCharPerLine - 3).trim() + '...';
  }

  return lines
    .map(line => `<tspan x="${xOffset}" dy="1.2em">${line}</tspan>`)
    .join('');
}


function createRow(item: OrderItem, yOffset: number): string {
  return `
    <g
     id="g492"
     inkscape:label="row"
     transform="translate(0, ${yOffset})">
  <text
    xml:space="preserve"
    style="font-weight:normal;font-size:3.88056px;font-family:sans-serif;text-align:start;text-anchor:start;fill:#000000;stroke-width:0.2"
    x="14.5"
    y="102"
    id="sku"
    inkscape:label="sku">
    ${wrapText(item.sku, 18, 3, 14.5)}
   </text>

   <text
    xml:space="preserve"
    style="font-weight:normal;font-size:3.88056px;font-family:sans-serif;text-align:start;text-anchor:start;fill:#000000;stroke-width:0.2"
    x="45"
    y="102"
    id="description"
    inkscape:label="sku">
    ${wrapText(item.description, 11, 3, 45)}
   </text>
    
     <image
      width="12.009373"
      height="17.224628"
      preserveAspectRatio="none"
      xlink:href="${item.imageUrl}"
      id="image472"
      x="71.434631"
      y="101.9107"
      style="display:inline"
      inkscape:label="image" />

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

  const $ = cheerio.load(template, { xmlMode: true });  

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