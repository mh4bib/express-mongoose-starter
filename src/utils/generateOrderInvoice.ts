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
};

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
};
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
    lines[maxLine - 1] =
      lines[maxLine - 1].slice(0, maxCharPerLine - 3).trim() + '...';
  } else if (lines[lines.length - 1].length > maxCharPerLine) {
    lines[lines.length - 1] =
      lines[lines.length - 1].slice(0, maxCharPerLine - 3).trim() + '...';
  }

  if (
    lines.length === maxLine &&
    currentLine.length > 0 &&
    lines[maxLine - 1].length >= maxCharPerLine
  ) {
    lines[maxLine - 1] =
      lines[maxLine - 1].slice(0, maxCharPerLine - 3).trim() + '...';
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
     y="111.24982">${item.totalAmount.toFixed(2)}</tspan></text>
  <path
   id="path490"
   style="display:inline;fill:none;stroke:#6e7a7c;stroke-width:0.399413;stroke-dasharray:none;stroke-opacity:1"
   d="M 166.95167,101.15196 V 119.9991 M 145.85414,101.15196 V 119.9991 M 114.73527,101.15196 V 119.9991 M 85.726212,101.15196 V 119.9991 M 68.848273,101.15196 V 119.9991 M 43.531366,101.15196 v 18.84701 M 12.383494,101.04692 H 197.26903 V 119.9991 H 12.383494 Z"
   inkscape:label="border" />
   </g>
  `;
}

function generateCalculationRow1(yOffset: number): string {
  return `<g
   id="g492"
   inkscape:label="row"
   transform="translate(0, ${yOffset})">

<text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="163.89482"
   y="108.94336"
   id="text8936"><tspan
     id="tspan8934"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';text-align:end;text-anchor:end;stroke-width:0.4"
     x="163.89482"
     y="108.94336">Oginal Price:</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;text-anchor:end;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="196.34291"
   y="109.08092"
   id="text8940"><tspan
     id="tspan134"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';stroke-width:0.4"
     x="196.34291"
     y="109.08092">332.33</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="163.89482"
   y="117.83095"
   id="text9105"><tspan
     id="tspan9103"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';text-align:end;text-anchor:end;stroke-width:0.4"
     x="163.89482"
     y="117.83095">After Discount:</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;text-anchor:end;fill:#d40000;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="196.34291"
   y="117.7989"
   id="text9109"><tspan
     id="tspan139"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';fill:#d40000;stroke-width:0.4"
     x="196.34291"
     y="117.7989">332.33</tspan></text>
<text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="163.75418"
   y="126.73022"
   id="text9113"><tspan
     id="tspan9111"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';text-align:end;text-anchor:end;stroke-width:0.4"
     x="163.75418"
     y="126.73022">VAT:</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;text-anchor:end;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="196.19063"
   y="126.71421"
   id="text9117"><tspan
     id="vat"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';stroke-width:0.4"
     x="196.19063"
     y="126.71421">00</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="163.75418"
   y="135.61783"
   id="text9121"><tspan
     id="tspan9119"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';text-align:end;text-anchor:end;stroke-width:0.4"
     x="163.75418"
     y="135.61783">Shipping &amp; Handling:</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;text-anchor:end;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="196.20227"
   y="135.60231"
   id="text9125"><tspan
     id="shippingHandling"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';stroke-width:0.4"
     x="196.20227"
     y="135.60231">332.33</tspan></text><path
   style="fill:none;stroke:#e34234;stroke-width:0.396292;stroke-dasharray:none;stroke-opacity:1"
   d="m 123.2334,141.73068 h 72.77874"
   id="path9127" /><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:#1a1a1a;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="163.75418"
   y="149.86145"
   id="text15013"><tspan
     id="tspan15011"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';text-align:end;text-anchor:end;stroke-width:0.4"
     x="163.75418"
     y="149.86145">Grand Total:</tspan></text><text
   xml:space="preserve"
   style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:3.88056px;font-family:sans-serif;-inkscape-font-specification:sans-serif;font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-east-asian:normal;text-align:end;writing-mode:lr-tb;text-anchor:end;fill:#d40000;stroke:none;stroke-width:0.4;stroke-dasharray:none;stroke-opacity:1"
   x="196.1557"
   y="149.86145"
   id="text15017"><tspan
     id="grandTotal"
     style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:sans-serif;-inkscape-font-specification:'sans-serif Bold';fill:#d40000;stroke-width:0.4"
     x="196.1557"
     y="149.86145">178.00</tspan></text></g>
`;
}

function generateRows(items: OrderItem[]): string {
  return items.map((item, index) => createRow(item, index * 18.84714)).join('');
}

function splitIntoPages(
  items: OrderItem[],
  rowsPerPage: number
): OrderItem[][] {
  const pages = [];
  for (let i = 0; i < items.length; i += rowsPerPage) {
    pages.push(items.slice(i, i + rowsPerPage));
  }
  return pages;
}

export async function generateOrderInvoice(
  data: OrderData,
  firstPageTemplateName: string,
  otherPagesTemplateName: string
): Promise<Buffer> {
  const firstPageTemplate = await readFileAsync(
    `src/templates/${firstPageTemplateName}.svg`,
    'utf8'
  );
  const otherPagesTemplate = await readFileAsync(
    `src/templates/${otherPagesTemplateName}.svg`,
    'utf8'
  );

  // Load the first page template
  const firstPage = cheerio.load(firstPageTemplate, { xmlMode: true });

  // Populate static information for the first page
  firstPage('#orderNumber').text(data.orderNumber);
  firstPage('#orderDate').text(data.orderDate);
  firstPage('#soldToName').text(data.soldTo.name);
  firstPage('#soldToAddress').text(data.soldTo.address);
  firstPage('#soldToPostcode').text(data.soldTo.postalCode);
  firstPage('#shipToName').text(data.shipTo.name);
  firstPage('#shipToAddress').text(data.shipTo.address);
  firstPage('#shipToPostcode').text(data.shipTo.postalCode);

  // Split items for the first page and other pages
  const firstPageRows = data.items.slice(0, 10); // Up to 9 rows for the first page
  const remainingItems = data.items.slice(10); // Items for subsequent pages
  const otherPagesChunks = splitIntoPages(remainingItems, 14); // Up to 14 rows per subsequent page

  // Generate PDF
  const doc = new PDFDocument({ size: 'A4' });
  const pdfBuffer: Buffer[] = [];
  doc.on('data', pdfBuffer.push.bind(pdfBuffer));

  // Generate the first page
  const firstPageTableRows = generateRows(firstPageRows);
  firstPage('#rows').html(firstPageTableRows);
  SVGtoPDF(doc, firstPage.xml(), 0, 0, {
    preserveAspectRatio: 'xMinYMin meet',
  });

  let lastPage = firstPage;

  // Calculate how many rows are left on the last page
  const remainingRows =
    remainingItems.length > 0
      ? remainingItems.length % 14 === 0
        ? 0
        : 14 - (remainingItems.length % 14)
      : firstPageRows.length % 10 === 0
      ? 0
      : 10 - (firstPageRows.length % 10);

  // Generate subsequent pages
  for (const pageItems of otherPagesChunks) {
    doc.addPage();
    const otherPage = cheerio.load(otherPagesTemplate, { xmlMode: true });
    const otherPageTableRows = generateRows(pageItems);
    otherPage('#rows').html(otherPageTableRows);

    lastPage = otherPage;

    // Add calculation row
    // otherPage('#rows').append(
    //   generateCalculationRow1(pageItems.length * 18.84714)
    // );

    if (
      otherPagesChunks.indexOf(pageItems) !==
      otherPagesChunks.length - 1 // Not the last page
    ) {
      SVGtoPDF(doc, otherPage.xml(), 0, 0, {
        preserveAspectRatio: 'xMinYMin meet',
      });
    } else if (remainingRows <= 2) {
      // Last page with 2 or fewer rows
      SVGtoPDF(doc, otherPage.xml(), 0, 0, {
        preserveAspectRatio: 'xMinYMin meet',
      });
    }
  }

  if (remainingRows > 2) {
    const yOffset =
      remainingItems.length > 0
        ? remainingItems.length % 14
        : firstPageRows.length % 10;

    lastPage('#rows').append(generateCalculationRow1(yOffset * 18.84714));
    SVGtoPDF(doc, lastPage.xml(), 0, 0, {
      preserveAspectRatio: 'xMinYMin meet',
    });
  } else {
    doc.addPage();
    const lastPage = cheerio.load(otherPagesTemplate, { xmlMode: true });
    lastPage('#rows').append(generateCalculationRow1(0));
    SVGtoPDF(doc, lastPage.xml(), 0, 0, {
      preserveAspectRatio: 'xMinYMin meet',
    });
  }

  doc.end();

  return new Promise(resolve => {
    doc.on('end', () => {
      resolve(Buffer.concat(pdfBuffer));
    });
  });
}
