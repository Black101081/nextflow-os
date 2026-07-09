import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'nextflow_offline_db';
const DB_VERSION = 1;

export interface SyncTask {
  id: string; // uuid
  type: 'UPDATE_STATUS' | 'ADD_EVIDENCE';
  payload: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cache của GET /api/v1/work-items
        if (!db.objectStoreNames.contains('work_items_cache')) {
          db.createObjectStore('work_items_cache', { keyPath: 'id' });
        }
        // Hàng đợi các request POST/PATCH khi rớt mạng
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const offlineService = {
  // --- Work Items Cache ---
  async saveWorkItemsToCache(items: any[]) {
    const db = await getDb();
    const tx = db.transaction('work_items_cache', 'readwrite');
    // Xoá cũ
    await tx.objectStore('work_items_cache').clear();
    // Lưu mới
    for (const item of items) {
      await tx.objectStore('work_items_cache').put(item);
    }
    await tx.done;
  },

  async getWorkItemsFromCache(): Promise<any[]> {
    const db = await getDb();
    return db.getAll('work_items_cache');
  },

  async updateWorkItemStatusInCache(id: string, newStatus: string) {
    const db = await getDb();
    const tx = db.transaction('work_items_cache', 'readwrite');
    const store = tx.objectStore('work_items_cache');
    const item = await store.get(id);
    if (item) {
      item.status = newStatus;
      await store.put(item);
    }
    await tx.done;
  },

  // --- Sync Queue ---
  async enqueueSyncTask(task: SyncTask) {
    const db = await getDb();
    await db.put('sync_queue', task);
  },

  async getSyncQueue(): Promise<SyncTask[]> {
    const db = await getDb();
    const all = await db.getAll('sync_queue');
    return all.sort((a, b) => a.timestamp - b.timestamp);
  },

  async removeSyncTask(id: string) {
    const db = await getDb();
    await db.delete('sync_queue', id);
  },

  // Helper check online
  isOnline(): boolean {
    return navigator.onLine;
  }
};
