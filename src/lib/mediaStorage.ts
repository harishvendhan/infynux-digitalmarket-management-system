import { getCurrentUserScope } from './userScope';

export interface DeliverableMedia {
  id: string;
  userScope?: string;
  projectId: string;
  projectTitle: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  contentType: 'reel' | 'post' | 'video' | 'general';
  imageUrl: string;
  createdAt: string;
  date: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  watchTime?: string;
  notes?: string;
}

const DB_NAME = 'AntigravityMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'deliverable_media';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback image (SVG data URL representing a marketing reel insight card)
export const DEFAULT_DEMO_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900" fill="%23111827"><rect width="600" height="900" fill="%230f172a"/><rect x="40" y="40" width="520" height="820" rx="24" fill="%231e293b" stroke="%23334155" stroke-width="2"/><text x="300" y="110" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23f8fafc" text-anchor="middle">Reel Insights</text><rect x="180" y="150" width="240" height="340" rx="16" fill="%234338ca"/><text x="300" y="320" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23ffffff" text-anchor="middle">Campaign Deliverable</text><text x="300" y="355" font-family="sans-serif" font-size="14" fill="%23c7d2fe" text-anchor="middle">Hotel Room Luxury Tour</text><rect x="70" y="520" width="220" height="130" rx="16" fill="%23334155"/><text x="100" y="565" font-family="sans-serif" font-size="14" fill="%2394a3b8">Total Views</text><text x="100" y="615" font-family="sans-serif" font-size="32" font-weight="bold" fill="%2338bdf8">3,254</text><rect x="310" y="520" width="220" height="130" rx="16" fill="%23334155"/><text x="340" y="565" font-family="sans-serif" font-size="14" fill="%2394a3b8">Unique Viewers</text><text x="340" y="615" font-family="sans-serif" font-size="32" font-weight="bold" fill="%234ade80">2,447</text><rect x="70" y="670" width="460" height="150" rx="16" fill="%23334155"/><text x="100" y="715" font-family="sans-serif" font-size="15" fill="%2394a3b8">Engagement Overview</text><text x="100" y="775" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23f8fafc">Likes: 96  •  Shares: 32  •  Saves: 3</text></svg>`;

export const DEMO_MEDIA_ITEMS: DeliverableMedia[] = [
  {
    id: 'media-demo-1',
    userScope: 'demo@agency.com',
    projectId: '11111111-1111-1111-1111-111111111111',
    projectTitle: 'Emirates Inn Digital Marketing',
    taskTitle: 'Executive suite tour (Reel)',
    title: 'Customer Testimonial & Suite Tour Reel Insights',
    contentType: 'reel',
    imageUrl: DEFAULT_DEMO_IMAGE,
    createdAt: new Date().toISOString(),
    date: '2026-10-06',
    views: 3254,
    likes: 96,
    comments: 2,
    shares: 32,
    watchTime: '12s',
    notes: 'High organic engagement with business travelers. 26 new profile follows generated.',
  },
];

export async function getAllMedia(): Promise<DeliverableMedia[]> {
  const currentScope = getCurrentUserScope();
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const allItems = (req.result as DeliverableMedia[]) || [];
        const userItems = allItems.filter(
          (item) => (item.userScope || 'demo@agency.com') === currentScope
        );

        if (userItems.length === 0 && currentScope === 'demo@agency.com') {
          saveMedia(DEMO_MEDIA_ITEMS[0]).then(() => resolve(DEMO_MEDIA_ITEMS));
        } else {
          resolve(
            userItems.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
        }
      };

      req.onerror = () => {
        resolve(currentScope === 'demo@agency.com' ? DEMO_MEDIA_ITEMS : []);
      };
    });
  } catch {
    return currentScope === 'demo@agency.com' ? DEMO_MEDIA_ITEMS : [];
  }
}

export async function saveMedia(item: DeliverableMedia): Promise<void> {
  const currentScope = getCurrentUserScope();
  const scopedItem: DeliverableMedia = {
    ...item,
    userScope: item.userScope || currentScope,
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(scopedItem);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save to indexedDB:', err);
  }
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete from indexedDB:', err);
  }
}
