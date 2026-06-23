const PDFDocument = require('pdfkit');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (val) => {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d)) return String(val);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

const escapeCSV = (val) => {
  if (val == null) return '';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
};

// Use YYYY.MM.DD with dots — Excel never auto-parses dot-separated dates as date serials
const escapeCSVDate = (val) => {
  if (!val) return '""';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d)) return `"${String(val)}"`;
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(d.getUTCDate()).padStart(2, '0');
  return `"${yyyy}.${mm}.${dd}"`;
};

const fmt = (n) => Number(n).toFixed(2);

// ─── CSV ──────────────────────────────────────────────────────────────────────

exports.generateCSV = (transactions, meta = {}) => {
  const { name = '', email = '', filters = {} } = meta;
  const now = new Date().toISOString().split('T')[0];

  const dateRange =
    filters.startDate && filters.endDate
      ? `${filters.startDate} to ${filters.endDate}`
      : filters.startDate
      ? `From ${filters.startDate}`
      : filters.endDate
      ? `To ${filters.endDate}`
      : 'All dates';

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const meta_rows = [
    `"Spend Matrix - Transaction Export"`,
    `"Exported By:","${name}"`,
    `"Email:","${email}"`,
    `"Export Date:","${now}"`,
    `"Date Range:","${dateRange}"`,
    filters.type ? `"Type Filter:","${filters.type}"` : null,
    filters.search ? `"Search:","${filters.search}"` : null,
    `"Total Records:","${transactions.length}"`,
    `"Total Income:","${fmt(totalIncome)}"`,
    `"Total Expense:","${fmt(totalExpense)}"`,
    `"Net Balance:","${fmt(totalIncome - totalExpense)}"`,
    `""`, // blank separator row
    `"Date","Type","Category","Amount","Payment Source","Description"`,
  ].filter((r) => r !== null);

  const rows = transactions.map((t) =>
    [
      escapeCSVDate(t.transaction_date),
      escapeCSV(t.type),
      escapeCSV(t.category_name),
      escapeCSV(fmt(t.amount)),
      escapeCSV(t.payment_source),
      escapeCSV(t.description),
    ].join(',')
  );

  return '﻿' + [...meta_rows, ...rows].join('\n');
};

// ─── PDF ──────────────────────────────────────────────────────────────────────

exports.generatePDF = (transactions, meta = {}) => {
  return new Promise((resolve, reject) => {
    const { name = '', email = '', filters = {} } = meta;
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width - 80; // usable width (margin 40 each side)
    const L = 40; // left margin

    // ── Title ──
    doc.fontSize(20).font('Helvetica-Bold').text('Spend Matrix', { align: 'center' });
    doc.fontSize(13).font('Helvetica').text('Transaction Report', { align: 'center' });
    doc.moveDown(0.6);

    // ── Divider ──
    doc.moveTo(L, doc.y).lineTo(L + pageW, doc.y).lineWidth(1).stroke('#4F46E5');
    doc.moveDown(0.6);

    // ── User Info block ──
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const dateRange =
      filters.startDate && filters.endDate
        ? `${filters.startDate}  →  ${filters.endDate}`
        : filters.startDate
        ? `From ${filters.startDate}`
        : filters.endDate
        ? `To ${filters.endDate}`
        : 'All dates';

    const infoY = doc.y;
    doc.fontSize(9).font('Helvetica-Bold').text('Exported By:', L, infoY);
    doc.font('Helvetica').text(`${name}  (${email})`, L + 75, infoY);

    const infoY2 = doc.y;
    doc.font('Helvetica-Bold').text('Date Range:', L, infoY2);
    doc.font('Helvetica').text(dateRange, L + 75, infoY2);

    const infoY3 = doc.y;
    doc.font('Helvetica-Bold').text('Export Date:', L, infoY3);
    doc.font('Helvetica').text(now, L + 75, infoY3);

    if (filters.type) {
      const infoY4 = doc.y;
      doc.font('Helvetica-Bold').text('Type Filter:', L, infoY4);
      doc.font('Helvetica').text(filters.type, L + 75, infoY4);
    }
    if (filters.search) {
      const infoY5 = doc.y;
      doc.font('Helvetica-Bold').text('Search:', L, infoY5);
      doc.font('Helvetica').text(filters.search, L + 75, infoY5);
    }

    doc.moveDown(0.8);

    // ── Summary bar ──
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + parseFloat(t.amount), 0);
    const net = totalIncome - totalExpense;

    const summaryY = doc.y;
    doc.rect(L, summaryY, pageW, 28).fill('#F5F3FF');
    doc.fillColor('#1F2937').fontSize(9).font('Helvetica-Bold');
    doc.text(`Records: ${transactions.length}`, L + 8, summaryY + 8, { continued: true });
    doc.text(`   |   Income: ₹${fmt(totalIncome)}`, { continued: true });
    doc.text(`   |   Expense: ₹${fmt(totalExpense)}`, { continued: true });
    doc.text(`   |   Net: ₹${fmt(net)}`, { continued: false });
    doc.moveDown(1.2);

    // ── Table ──
    // Column x positions and widths
    const cols = [
      { label: 'Date',           x: L,       w: 72  },
      { label: 'Type',           x: L + 72,  w: 52  },
      { label: 'Category',       x: L + 124, w: 90  },
      { label: 'Amount (₹)',     x: L + 214, w: 72  },
      { label: 'Source',         x: L + 286, w: 72  },
      { label: 'Description',    x: L + 358, w: 157 },
    ];

    const ROW_H = 18;
    const HEADER_H = 20;

    const drawTableHeader = (y) => {
      doc.rect(L, y, pageW, HEADER_H).fill('#4F46E5');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      cols.forEach((c) => {
        doc.text(c.label, c.x + 4, y + 5, { width: c.w - 6, ellipsis: true });
      });
      return y + HEADER_H;
    };

    const drawTableRow = (t, y, shade) => {
      if (shade) doc.rect(L, y, pageW, ROW_H).fill('#F9FAFB');
      doc.fillColor('#374151').fontSize(8).font('Helvetica');

      const date = formatDate(t.transaction_date);
      const typeColor = t.type === 'income' ? '#059669' : '#DC2626';

      doc.text(date, cols[0].x + 4, y + 4, { width: cols[0].w - 6, ellipsis: true });

      doc.fillColor(typeColor).font('Helvetica-Bold');
      doc.text(t.type, cols[1].x + 4, y + 4, { width: cols[1].w - 6, ellipsis: true });

      doc.fillColor('#374151').font('Helvetica');
      doc.text(t.category_name ?? '', cols[2].x + 4, y + 4, { width: cols[2].w - 6, ellipsis: true });

      doc.fillColor(typeColor).font('Helvetica-Bold');
      doc.text(fmt(t.amount), cols[3].x + 4, y + 4, { width: cols[3].w - 6, ellipsis: true });

      doc.fillColor('#374151').font('Helvetica');
      doc.text(t.payment_source ?? '', cols[4].x + 4, y + 4, { width: cols[4].w - 6, ellipsis: true });
      doc.text(t.description ?? '', cols[5].x + 4, y + 4, { width: cols[5].w - 6, ellipsis: true });

      // row bottom border
      doc.moveTo(L, y + ROW_H).lineTo(L + pageW, y + ROW_H).lineWidth(0.3).strokeColor('#E5E7EB').stroke();
    };

    let curY = doc.y;
    curY = drawTableHeader(curY);

    transactions.forEach((t, i) => {
      if (curY + ROW_H > doc.page.height - 60) {
        doc.addPage();
        curY = 40;
        curY = drawTableHeader(curY);
      }
      drawTableRow(t, curY, i % 2 === 1);
      curY += ROW_H;
    });

    // ── Footer ──
    doc.fontSize(8).fillColor('#9CA3AF').font('Helvetica')
      .text(`Generated by Spend Matrix  •  ${now}`, L, doc.page.height - 30, {
        width: pageW,
        align: 'center',
      });

    doc.end();
  });
};
