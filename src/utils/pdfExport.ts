import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ExamPaper } from '../types/paper';

function getSafePdfFilename(paper: ExamPaper): string {
  const base = (paper.header.subject || paper.header.examName || 'Question_Paper')
    .replace(/[^\w\u0980-\u09FF-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48);
  return `${base || 'ProshnoPatra'}_${new Date().toISOString().slice(0, 10)}.pdf`;
}

/**
 * Generates a crisp, multi-page A4 PDF directly from the live A4 sheet element
 * using the browser's native text shaper (preserving Bangla conjuncts & KaTeX math).
 * Works reliably everywhere, including inside sandboxed preview iframes.
 */
export async function exportPaperToPdf(paper: ExamPaper): Promise<void> {
  const sourceSheet = document.getElementById('proshnopatra-sheet');
  if (!sourceSheet) {
    throw new Error('A4 preview sheet not found');
  }

  // Ensure web fonts are loaded before rendering
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Clone the sheet off-screen at true unscaled 1:1 A4 width (210mm = 794px at 96dpi)
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '794px';
  wrapper.style.background = '#ffffff';
  wrapper.style.zIndex = '-1';
  wrapper.style.pointerEvents = 'none';

  const clone = sourceSheet.cloneNode(true) as HTMLElement;
  clone.id = 'proshnopatra-sheet-export';
  clone.style.display = 'block';
  clone.style.transform = 'none';
  clone.style.width = '794px';
  clone.style.minHeight = '1123px';
  clone.style.border = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';

  // Remove on-screen page break guide lines from the PDF output
  clone.querySelectorAll('.page-guide-line').forEach((el) => el.remove());

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const captureOptions = {
      backgroundColor: '#ffffff',
      pixelRatio: 2.25,
      cacheBust: false,
      width: 794,
      height: clone.scrollHeight,
    };

    let canvas: HTMLCanvasElement;
    try {
      canvas = await toCanvas(clone, captureOptions);
    } catch {
      // Fallback if external stylesheet font reading is restricted by browser policy
      canvas = await toCanvas(clone, { ...captureOptions, skipFonts: true });
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const pxPerMm = imgWidthPx / pageWidthMm;
    const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < imgHeightPx - 4) {
      const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - offsetY);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, imgWidthPx, sliceHeightPx);
        ctx.drawImage(
          canvas,
          0,
          offsetY,
          imgWidthPx,
          sliceHeightPx,
          0,
          0,
          imgWidthPx,
          sliceHeightPx
        );
      }

      const sliceHeightMm = sliceHeightPx / pxPerMm;
      const imgData = pageCanvas.toDataURL('image/png');

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMm, sliceHeightMm, undefined, 'FAST');

      offsetY += pageHeightPx;
      pageIndex += 1;
    }

    pdf.save(getSafePdfFilename(paper));
  } finally {
    document.body.removeChild(wrapper);
  }
}

/**
 * Attempts native vector browser print (`window.print()`).
 * If running inside a sandboxed iframe that silently blocks `window.print()`
 * (detected when `beforeprint` never fires), automatically exports a crisp A4 PDF file
 * so the teacher never experiences a silent dead click.
 */
export async function triggerSmartPrint(paper: ExamPaper): Promise<'printed' | 'downloaded'> {
  let printTriggered = false;
  const onBeforePrint = () => {
    printTriggered = true;
  };

  window.addEventListener('beforeprint', onBeforePrint, { once: true });

  try {
    window.print();
  } catch {
    printTriggered = false;
  }

  // Give browser a brief tick to fire beforeprint if native dialog opened
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  window.removeEventListener('beforeprint', onBeforePrint);

  if (printTriggered) {
    return 'printed';
  }

  // Native print was blocked by iframe sandbox — immediately download real A4 PDF
  await exportPaperToPdf(paper);
  return 'downloaded';
}
