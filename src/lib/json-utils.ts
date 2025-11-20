import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src/data');

export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, `${filename}`);

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Faylni o'qishda xatolik: ${filename}`, error);
    throw error;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, `${filename}`);

  try {
    // Papka mavjudligini tekshirish
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Faylga yozishda xatolik: ${filename}`, error);
    throw error;
  }
}
