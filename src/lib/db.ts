import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  query,
  limit
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

/**
 * Seeds a collection with initial data if it has never been seeded before and is empty.
 * Runs independently from listeners to prevent transient offline empty snapshots from overwriting server state.
 */
export async function seedInitialCollection<T extends { id: string }>(
  colName: string,
  initialData: T[]
) {
  if (!initialData || initialData.length === 0) return;
  
  try {
    const metaRef = doc(db, 'seeding_metadata', colName);
    
    // Check using standard getDoc (very reliable offline and online)
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists() && metaSnap.data()?.seeded) {
      return; // Already seeded, skip completely to avoid overwriting or re-creating deleted items
    }

    // Double check if the collection actually contains any documents
    const colRef = collection(db, colName);
    const q = query(colRef, limit(1));
    const querySnap = await getDocs(q);
    
    if (querySnap.empty) {
      console.log(`Seeding initial data for collection: ${colName}`);
      for (const item of initialData) {
        await setDoc(doc(db, colName, item.id), item);
      }
    }

    // Mark as seeded in seeding_metadata so we NEVER run this again
    await setDoc(metaRef, { seeded: true });
  } catch (e) {
    // If there is any error (e.g. offline, permission, server down), 
    // we MUST NOT seed to prevent accidental overwrites or re-creating deleted data.
    console.error(`Error in seedInitialCollection for ${colName}:`, e);
  }
}

/**
 * Seeds a single document with initial data if it does not exist in Firestore.
 */
export async function seedInitialDoc<T>(
  colName: string,
  docId: string,
  initialData: T
) {
  try {
    const docRef = doc(db, colName, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log(`Seeding initial document: ${colName}/${docId}`);
      await setDoc(docRef, initialData as any);
    }
  } catch (e) {
    console.error(`Error in seedInitialDoc for ${colName}/${docId}:`, e);
  }
}

/**
 * Listens to a Firestore collection in real-time.
 * Strictly read-only, does not trigger any seeding.
 */
export function listenCollection<T>(
  colName: string, 
  callback: (data: T[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, colName);
  return onSnapshot(colRef, (snapshot) => {
    const data: T[] = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    callback(data);
  }, (error) => {
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.LIST, colName);
    }
  });
}

/**
 * Listens to a single Firestore document in real-time.
 * Strictly read-only, does not trigger any seeding.
 */
export function listenDoc<T>(
  colName: string, 
  docId: string, 
  callback: (data: T) => void,
  onError?: (error: any) => void
) {
  const docRef = doc(db, colName, docId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as T);
    }
  }, (error) => {
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.GET, `${colName}/${docId}`);
    }
  });
}

/**
 * Saves or updates an item in a Firestore collection.
 */
export async function saveItem<T extends { id: string }>(colName: string, item: T): Promise<void>;
export async function saveItem(colName: string, id: string, data: any): Promise<void>;
export async function saveItem(colName: string, idOrItem: any, data?: any) {
  const id = typeof idOrItem === 'string' ? idOrItem : idOrItem?.id;
  const payload = typeof idOrItem === 'string' ? data : idOrItem;
  try {
    await setDoc(doc(db, colName, id), payload);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${colName}/${id}`);
  }
}

/**
 * Deletes an item from a Firestore collection.
 */
export async function deleteItem(colName: string, id: string) {
  try {
    await deleteDoc(doc(db, colName, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${colName}/${id}`);
  }
}

/**
 * Saves or updates a settings/single document.
 */
export async function saveDoc(colName: string, docId: string, data: any) {
  try {
    await setDoc(doc(db, colName, docId), data);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${colName}/${docId}`);
  }
}

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 */
const CLOUDINARY_CLOUD_NAME = 'ktb87j8i';
const CLOUDINARY_UPLOAD_PRESET = 'kcf-homepage';

const getCloudinaryFolder = (pathStr: string) => {
  const parts = pathStr.replace(/^\/+/, '').split('/').filter(Boolean);
  parts.pop();

  return parts.length > 0
    ? `kcf-homepage/${parts.join('/')}`
    : 'kcf-homepage/uploads';
};

export async function uploadFileToStorage(pathStr: string, file: File): Promise<string> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', getCloudinaryFolder(pathStr));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary 업로드 실패: ${errorText}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error('Cloudinary 업로드는 성공했지만 이미지 URL을 받지 못했습니다.');
  }

  return data.secure_url as string;
}
