import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

export interface PaymentRequest {
  id: string;
  amount: string;
  description: string;
  recipientAddress: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  txHash?: string;
  createdAt: number;
}

export function getDb(): PaymentRequest[] {
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

export function saveToDb(data: PaymentRequest[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function addPaymentRequest(request: PaymentRequest) {
  const db = getDb();
  db.push(request);
  saveToDb(db);
}

export function updatePaymentRequest(id: string, updates: Partial<PaymentRequest>) {
  const db = getDb();
  const index = db.findIndex(r => r.id === id);
  if (index !== -1) {
    db[index] = { ...db[index], ...updates };
    saveToDb(db);
  }
}
