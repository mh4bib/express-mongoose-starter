import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import puppeteer from 'puppeteer';

type PdfOptions = {
  format?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export async function generatePdf(
  templateName: string,
  data: Record<string, any>,
  options: PdfOptions = {}
) {
  try {
    // Read the HTML template
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Compile the template
    const template = handlebars.compile(templateContent);

    // Render the template with the provided data
    const html = template(data);

    // Launch a new browser instance
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // await page.emulateMediaType('screen');

    // Generate PDF
    const pdf = await page.pdf({
      format: options.format || 'A4',
      landscape: options.orientation === 'landscape',
      margin: options.margin || { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });

    // Close the browser
    await browser.close();

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}