import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export const generateQRCode = async (
  data: string,
  outputPath: string
): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300
    });

    // Convert data URL to buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

export const generateQRCodeDataURL = async (data: string): Promise<string> => {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300
  });
};



