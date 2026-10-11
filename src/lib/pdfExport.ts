import { jsPDF } from 'jspdf';
import type { DeliverableMedia } from './mediaStorage';

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 600,
        height: img.naturalHeight || 800,
      });
    };
    img.onerror = () => resolve({ width: 600, height: 800 });
    img.src = dataUrl;
  });
}

async function prepareImageForPdf(dataUrl: string): Promise<{ dataUrl: string; width: number; height: number; format: string }> {
  const dims = await getImageDimensions(dataUrl);

  // If SVG, convert to PNG via Canvas for jsPDF compatibility
  if (dataUrl.startsWith('data:image/svg')) {
    const pngUrl = await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

    return { dataUrl: pngUrl, width: dims.width, height: dims.height, format: 'PNG' };
  }

  const format = dataUrl.includes('image/png') ? 'PNG' : 'JPEG';
  return { dataUrl, width: dims.width, height: dims.height, format };
}

export async function exportSingleMediaPdf(item: DeliverableMedia): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const usableWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFYNUX DIGITAL MARKET MANAGEMENT', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Deliverable Proof & Performance Report', margin, 18);

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Generated: ${reportDate}`, pageWidth - margin, 18, { align: 'right' });

  // Project & Deliverable Details Box
  let currentY = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, usableWidth, 24, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(item.title, margin + 4, currentY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Project: ${item.projectTitle}`, margin + 4, currentY + 14);
  doc.text(`Type: ${item.contentType.toUpperCase()}  •  Date: ${item.date}`, margin + 4, currentY + 19);

  currentY += 28;

  // Screenshot Image
  const prep = await prepareImageForPdf(item.imageUrl);
  const aspectRatio = prep.width / prep.height;
  const isTall = aspectRatio < 0.85;

  const maxImgHeight = isTall ? 155 : pageHeight - currentY - 24;
  const maxAllowedWidth = isTall ? 88 : usableWidth;

  let renderWidth = maxAllowedWidth;
  let renderHeight = renderWidth / aspectRatio;

  if (renderHeight > maxImgHeight) {
    renderHeight = maxImgHeight;
    renderWidth = renderHeight * aspectRatio;
  }

  const imgX = margin + (usableWidth - renderWidth) / 2;

  // Image border frame
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(imgX - 1.5, currentY - 1.5, renderWidth + 3, renderHeight + 3, 2, 2, 'FD');

  doc.addImage(prep.dataUrl, prep.format, imgX, currentY, renderWidth, renderHeight, undefined, 'FAST');

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Infynux Digital Market Management • Client Verified Deliverable Proof',
    margin,
    pageHeight - 8
  );
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 8, { align: 'right' });

  const safeFilename = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${safeFilename}_proof.pdf`);
}

export async function exportMultiMediaPdf(items: DeliverableMedia[], reportTitle: string = 'Campaign Deliverables Report'): Promise<void> {
  if (items.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const usableWidth = pageWidth - margin * 2;

  // Cover Page
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text('INFYNUX DIGITAL MARKET MANAGEMENT', margin, 78);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle.toUpperCase(), margin, 90);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Client Deliverables & Analytics Proof Package', margin, 102);

  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1.5);
  doc.line(margin, 110, margin + 40, 110);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Generated on: ${nowStr}`, margin, 125);
  doc.text(`Total Deliverable Proofs: ${items.length}`, margin, 132);

  // Each Deliverable as a Page
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    doc.addPage('a4', 'portrait');

    // Header Banner
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFYNUX DIGITAL MARKET MANAGEMENT', margin, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Deliverable Proof ${i + 1} of ${items.length}`, margin, 17);
    doc.text(item.projectTitle, pageWidth - margin, 17, { align: 'right' });

    let currentY = 32;

    // Info Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, usableWidth, 22, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, margin + 4, currentY + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Type: ${item.contentType.toUpperCase()}  •  Date: ${item.date}`, margin + 4, currentY + 14);


    currentY += 28;

    // Image
    const prep = await prepareImageForPdf(item.imageUrl);
    const aspectRatio = prep.width / prep.height;
    const isTall = aspectRatio < 0.85;

    const maxImgHeight = isTall ? 155 : pageHeight - currentY - 24;
    const maxAllowedWidth = isTall ? 88 : usableWidth;

    let renderWidth = maxAllowedWidth;
    let renderHeight = renderWidth / aspectRatio;

    if (renderHeight > maxImgHeight) {
      renderHeight = maxImgHeight;
      renderWidth = renderHeight * aspectRatio;
    }

    const imgX = margin + (usableWidth - renderWidth) / 2;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(imgX - 1, currentY - 1, renderWidth + 2, renderHeight + 2, 2, 2, 'FD');

    doc.addImage(prep.dataUrl, prep.format, imgX, currentY, renderWidth, renderHeight, undefined, 'FAST');

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Infynux Digital Market Management • Client Verified Deliverable Proof',
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i + 2} of ${items.length + 1}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const safeFilename = reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${safeFilename}.pdf`);
}
