import * as cheerio from 'cheerio';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { promisify } from 'util';


const readFileAsync = promisify(fs.readFile);

function wrapText(
  text,
  maxCharPerLine,
  maxLine,
  xOffset,
) {
  const words = text.split(' ');
  const lines = [];
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


function createRow(item, yOffset) {
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
   style="font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;text-align:end;text-anchor:end;fill:#000000;stroke-width:0.2"
   x="111.71298"
   y="111.25758"
   id="text566"><tspan
     sodipodi:role="line"
     id="tspan564"
     style="stroke-width:0.2"
     x="111.71298"
     y="111.25758">${item.originalPrice.toFixed(2)}</tspan></text><text
   xml:space="preserve"
   style="font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;text-align:end;text-anchor:end;fill:#d40000;stroke-width:0.2"
   x="142.63557"
   y="111.25758"
   id="text752"><tspan
     sodipodi:role="line"
     id="tspan750"
     style="stroke-width:0.2;fill:#d40000"
     x="142.63557"
     y="111.25758">${item.afterDiscount.toFixed(2)}</tspan></text><text
   xml:space="preserve"
   style="font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;text-align:end;text-anchor:end;fill:#000000;stroke-width:0.2"
   x="156.35852"
   y="111.26534"
   id="text756"><tspan
     sodipodi:role="line"
     id="tspan754"
     style="text-align:center;text-anchor:middle;stroke-width:0.2"
     x="156.35852"
     y="111.26534">${item.quantity}</tspan></text><text
   xml:space="preserve"
   style="font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;text-align:end;text-anchor:end;fill:#000000;stroke-width:0.2"
   x="194.1713"
   y="111.24982"
   id="text921"><tspan
     sodipodi:role="line"
     id="tspan919"
     style="text-align:end;text-anchor:end;stroke-width:0.2"
     x="194.1713"
     y="111.24982">${item.totalAmount.toFixed(2)}</tspan></text><path
   id="path490"
   style="display:inline;fill:none;stroke:#6e7a7c;stroke-width:0.399413;stroke-dasharray:none;stroke-opacity:1"
   d="M 166.95167,101.15196 V 119.9991 M 145.85414,101.15196 V 119.9991 M 114.73527,101.15196 V 119.9991 M 85.726212,101.15196 V 119.9991 M 68.848273,101.15196 V 119.9991 M 43.531366,101.15196 v 18.84701 M 12.383494,101.04692 H 197.26903 V 119.9991 H 12.383494 Z"
   inkscape:label="border" /></g>
  `;
}

function generateRows(items){
  return items.map((item, index) => createRow(item, index * 18.84714)).join('');
}

export async function generateOrderInvoice(data, templateName) {
  // Read the SVG template
  const template = await readFileAsync(`src/templates/${templateName}.svg`, 'utf8');

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
  const pdfBuffer = [];

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