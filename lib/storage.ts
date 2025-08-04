import fs from 'fs';
import path from 'path';

interface StorageData {
  users: any[];
  submissions: any[];
  lastUpdate: number;
}

const DATA_PATH = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_PATH, 'storage.json');

class PersistentStorage {
  private defaultData: StorageData = {
    users: [],
    submissions: [],
    lastUpdate: Date.now(),
  };

  private ensureFile() {
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH);
    }
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.defaultData, null, 2));
    }
  }

  private getData(): StorageData {
    this.ensureFile();
    try {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error reading from storage file:', error);
      return this.defaultData;
    }
  }

  private setData(data: StorageData): void {
    this.ensureFile();
    try {
      fs.writeFileSync(
        STORAGE_FILE,
        JSON.stringify({ ...data, lastUpdate: Date.now() }, null, 2)
      );
    } catch (error) {
      console.error('Error writing to storage file:', error);
    }
  }

  getUsers(): any[] {
    return this.getData().users;
  }

  setUsers(users: any[]): void {
    const data = this.getData();
    data.users = users;
    this.setData(data);
  }

  getSubmissions(): any[] {
    return this.getData().submissions;
  }

  setSubmissions(submissions: any[]): void {
    const data = this.getData();
    data.submissions = submissions;
    this.setData(data);
  }

  clear(): void {
    this.setData(this.defaultData);
  }

  initialize(): void {
    this.ensureFile();
    const data = this.getData();
    if (data.users.length === 0 && data.submissions.length === 0) {
      console.log('Initializing storage with demo data...');
      this.setData(this.defaultData);
    }
  }
}

export const storage = new PersistentStorage();

// Initialize storage when module is loaded
storage.initialize(); 