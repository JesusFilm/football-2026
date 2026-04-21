import qrcode from "qrcode-generator";

export function renderQrSvg(text: string, size: number): string {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const quietZone = 4;
  const cell = size / (count + quietZone * 2);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="#fff"/>`;
  svg += `<g fill="#0a0806">`;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        svg += `<rect x="${(col + quietZone) * cell}" y="${(row + quietZone) * cell}" width="${cell}" height="${cell}"/>`;
      }
    }
  }
  svg += `</g></svg>`;
  return svg;
}
