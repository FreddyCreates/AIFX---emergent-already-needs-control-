import ExcelJS from 'exceljs';

export interface ExcelOptions {
  title: string;
  author?: string;
  sheets: ExcelSheet[];
}

export interface ExcelSheet {
  name: string;
  columns: string[];
  rows: (string | number)[][];
}

export async function generateExcel(opts: ExcelOptions): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = opts.author ?? 'JARVIS AI';
  workbook.lastModifiedBy = 'JARVIS AI v4.0';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  for (const sheetDef of opts.sheets) {
    const ws = workbook.addWorksheet(sheetDef.name || 'Sheet1');

    ws.addRow(sheetDef.columns);
    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C6EFF' } };
    header.alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getRow(1).height = 20;

    ws.columns = sheetDef.columns.map((c) => ({ header: c, key: c, width: Math.max(c.length + 4, 14) }));

    for (const row of sheetDef.rows) {
      ws.addRow(row);
    }

    for (let r = 2; r <= sheetDef.rows.length + 1; r++) {
      if (r % 2 === 0) {
        ws.getRow(r).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0FF' } };
      }
    }
  }

  const buf = await workbook.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function downloadExcel(opts: ExcelOptions, filename?: string): Promise<void> {
  const blob = await generateExcel(opts);
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    chrome.downloads.download(
      {
        url,
        filename: filename || `jarvis-report-${Date.now()}.xlsx`,
        saveAs: false,
      },
      () => {
        try {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        } finally {
          URL.revokeObjectURL(url);
        }
      },
    );
  });
}
