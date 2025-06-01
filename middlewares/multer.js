import multer from 'multer';

// ใช้ memory storage เพราะเราจะไม่เก็บไฟล์บนเครื่อง
const storage = multer.memoryStorage();

export const upload = multer({ storage });
