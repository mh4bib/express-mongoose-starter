import { Response } from 'express';
import PDFDocument from 'pdfkit';

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

export async function generateInvoice(res: Response, data: OrderData) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // Pipe the PDF to the response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=order-${data.orderNumber}.pdf`);
  doc.pipe(res);

  // Define table column widths and margins
  const skuWidth = 90;
  const descriptionWidth = 80;
  const imageWidth = 60;
  const originalPriceWidth = 80;
  const discountWidth = 80;
  const quantityWidth = 50;
  const totalWidth = 70;
  const tableTopStart = 270;
  const cellHeight = 60;
  const pageMargin = 30;

  let yPosition = tableTopStart;

  // Function to draw table row
  function drawRow(y: number, item: OrderItem) {
    doc.text(item.sku, 35, y+5, { width: skuWidth });
    doc.text(item.description, 42 + skuWidth, y+5, { width: descriptionWidth-10 });

    // Insert item image
    doc.image(item.imageUrl, 35 + skuWidth + descriptionWidth, y+5, { width: imageWidth-10 });

    doc.text(item.originalPrice.toFixed(2), 35 + skuWidth + descriptionWidth + imageWidth+15, y+5, { width: originalPriceWidth });
    doc.fillColor('red').text(item.afterDiscount.toFixed(2), 35 + skuWidth + descriptionWidth + imageWidth + originalPriceWidth+22, y+5, { width: discountWidth });
    doc.fillColor('black').text(item.quantity.toString(), 35 + skuWidth + descriptionWidth + imageWidth + originalPriceWidth + discountWidth+30, y+5, { width: quantityWidth });
    doc.text(item.totalAmount.toFixed(2), 35 + skuWidth + descriptionWidth + imageWidth + originalPriceWidth + discountWidth + quantityWidth + 30, y+5, { width: totalWidth });

    // Draw row border
    drawRowBorders(y, cellHeight);
  }

  // Function to draw borders for the table row
  function drawRowBorders(y: number, height: number) {
    doc.lineWidth(1);
    doc.rect(30, y, doc.page.width - pageMargin * 2, height).stroke();
  }

  // Check if new page is needed and add the table header again
  function checkNewPage() {
    if (yPosition + cellHeight > doc.page.height - 100) { // Check if the table exceeds the page
      doc.addPage();
      yPosition = 100; // Reset y position for new page
      drawTableHeaders(); // Draw the table headers on the new page
    }
  }

  // Function to draw table headers
  function drawTableHeaders() {
    doc.fontSize(12).fillColor('black');
    doc.text('SKU/ Size/ Color', 35, yPosition+5, { width: skuWidth });
    doc.text('Description', 40 + skuWidth+5, yPosition+5, { width: descriptionWidth });
    doc.text('Image', 30 + skuWidth + descriptionWidth +15, yPosition+5, { width: imageWidth });
    doc.text('Original Price', 30 + skuWidth + descriptionWidth + imageWidth+5, yPosition+5, { width: originalPriceWidth });
    doc.text('After Discount', 30 + skuWidth + descriptionWidth + imageWidth + originalPriceWidth+8, yPosition+5, { width: discountWidth });
    doc.text('Quantity', 30 + skuWidth + descriptionWidth + imageWidth + originalPriceWidth + discountWidth+15, yPosition+5, { width: quantityWidth });
    doc.text('Total Amount', 30 + skuWidth + descriptionWidth + imageWidth + originalPriceWidth + discountWidth + quantityWidth+20, yPosition+5, { width: totalWidth });
    
    // Draw header borders
    drawRowBorders(yPosition, 20);

    yPosition += 20; // Move the y position down for the next row
  }

  const upperTableStartY = 115;
  doc.rect(30, upperTableStartY, doc.page.width - pageMargin * 2, 45).fillAndStroke('#6E7A7C', '#6E7A7C'); // Gray background
    doc.fillColor('white').text('Order # QZ39480', 40, upperTableStartY+10);
    doc.text('Order Date: 18/09/2024', 40, upperTableStartY+26);

    // Table headers
    doc.fontSize(15).fillColor('black').text('Sold to:', 40, upperTableStartY+52);
    doc.text('Ship to:', 310, upperTableStartY+52);

    // Draw the table lines
    doc.lineWidth(1);
    
    // Column separation line
    // doc.moveTo(300, 75).lineTo(300, 200).stroke();

    // Rectangles for the text boxes
    doc.rect(30, upperTableStartY+45, (doc.page.width - pageMargin * 2)/2, 25).stroke(); // Sold to box
    doc.rect((doc.page.width - pageMargin * 2)/2+30, upperTableStartY+45, (doc.page.width - pageMargin * 2)/2, 25).stroke(); // Ship to box
    
    doc.rect(30, upperTableStartY+70, (doc.page.width - pageMargin * 2)/2, 70).stroke(); // Sold to box
    doc.rect((doc.page.width - pageMargin * 2)/2+30, upperTableStartY+70, (doc.page.width - pageMargin * 2)/2, 70).stroke(); // Ship to box
    
    // Fill in the 'Sold to' and 'Ship to' data
    doc.fontSize(12).text('test', 40, upperTableStartY+80);  // Sold to
    doc.text('test', 40, upperTableStartY+100);  // Sold01o
    doc.text('500000000', 40, upperTableStartY+120); // Sold to

    doc.text('test', 310, upperTableStartY+80);  // Ship to
    doc.text('test', 310, upperTableStartY+100);  // Ship to
    doc.text('500000000', 310, upperTableStartY+120);  // Ship to

  // Draw table headers
  drawTableHeaders();

  // Loop through the items and draw them on the PDF
  for (let i = 0; i < data.items.length; i++) {
    checkNewPage(); // Check if a new page is required
    drawRow(yPosition, data.items[i]); // Draw the row for the current item
    yPosition += cellHeight; // Adjust y position for the next row
  }

    doc.moveTo(128, tableTopStart).lineTo(128, tableTopStart+20+cellHeight * data.items.length).stroke();
    doc.moveTo(200, tableTopStart).lineTo(200, tableTopStart+20+cellHeight * data.items.length).stroke();
    doc.moveTo(261, tableTopStart).lineTo(261, tableTopStart+20+cellHeight * data.items.length).stroke();
    doc.moveTo(343, tableTopStart).lineTo(343, tableTopStart+20+cellHeight * data.items.length).stroke();
    doc.moveTo(430, tableTopStart).lineTo(430, tableTopStart+20+cellHeight * data.items.length).stroke();
    doc.moveTo(485, tableTopStart).lineTo(485, tableTopStart+20+cellHeight * data.items.length).stroke();

  // Add totals
  const totalsTop = yPosition + 20;
  doc.text('Original Price:', 430, totalsTop)
     .text(data.originalPrice.toFixed(2), 560, totalsTop)
     .text('After Discount:', 430, totalsTop + 20)
     .text(data.afterDiscount.toFixed(2), 560, totalsTop + 20)
     .text('VAT:', 430, totalsTop + 40)
     .text(data.vat.toFixed(2), 560, totalsTop + 40)
     .text('Shipping & Handling:', 430, totalsTop + 60)
     .text(data.shippingHandling.toFixed(2), 560, totalsTop + 60)
     .moveTo(430, totalsTop + 75)
     .lineTo(590, totalsTop + 75)
     .stroke()
     .text('Grand Total:', 430, totalsTop + 85)
     .text(data.grandTotal.toFixed(2), 560, totalsTop + 85);

  // Add footer
  doc.fontSize(10)
     .text('Thank you for placing the order with www.qazada.com. We highly appreciate your purchase.', 50, 700)
     .text('What happens next?', 50, 730)
     .text('1. Your order will be delivered in 15 to 17 working days.', 70, 745)
     .text('2. Our delivery time is between 11 am till 9 pm Saturday to Thursday.', 70, 760)
     .text('3. If you have any questions or concerns please contact us 00000 between 9 Am till 6 Pm Saturday to Thursday.', 70, 775);

  // Finalize the PDF and end the stream
  doc.end();
}
