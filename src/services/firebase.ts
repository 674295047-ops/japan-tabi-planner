// Firebase Configuration & Service Layer
// Fallback to localStorage gracefully if Firebase config is not yet supplied by user

import type { Destination } from '../types';
import type { SystemAnnouncement, RegisteredAccount, ActivityLogEntry } from '../types/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Read from Environment variables if available, with direct fallback
export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDhaOBEO0HbrDZcvZbvcucp0qlkD7JlJr0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'japan-tabi-planner-b3f88.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'japan-tabi-planner-b3f88',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'japan-tabi-planner-b3f88.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '379238889534',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:379238889534:web:e914396ccb44090c63b96f',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

/**
 * REST-based Firestore Client (Lightweight, zero-dependency, works directly in browser without bundling heavy SDK)
 */
class FirestoreRestClient {
  private projectId: string;
  private baseUrl: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  }

  // Convert plain JS object to Firestore Document format
  private toFirestoreFormat(data: any): any {
    const fields: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (val === null || val === undefined) {
        fields[key] = { nullValue: null };
      } else if (typeof val === 'string') {
        fields[key] = { stringValue: val };
      } else if (typeof val === 'number') {
        if (Number.isInteger(val)) {
          fields[key] = { integerValue: val.toString() };
        } else {
          fields[key] = { doubleValue: val };
        }
      } else if (typeof val === 'boolean') {
        fields[key] = { booleanValue: val };
      } else if (Array.isArray(val)) {
        fields[key] = {
          arrayValue: {
            values: val.map(v => this.toFirestoreFormat({ v }).v),
          },
        };
      } else if (typeof val === 'object') {
        fields[key] = {
          mapValue: {
            fields: this.toFirestoreFormat(val),
          },
        };
      }
    }
    return fields;
  }

  // Convert Firestore Document format back to plain JS object
  private fromFirestoreFormat(doc: any): any {
    if (!doc || !doc.fields) return null;
    const result: any = {};
    for (const [key, val] of Object.entries(doc.fields) as any) {
      if ('stringValue' in val) result[key] = val.stringValue;
      else if ('integerValue' in val) result[key] = parseInt(val.integerValue, 10);
      else if ('doubleValue' in val) result[key] = val.doubleValue;
      else if ('booleanValue' in val) result[key] = val.booleanValue;
      else if ('nullValue' in val) result[key] = null;
      else if ('arrayValue' in val) {
        result[key] = (val.arrayValue.values || []).map((item: any) => {
          const temp = this.fromFirestoreFormat({ fields: { item } });
          return temp ? temp.item : null;
        });
      } else if ('mapValue' in val) {
        result[key] = this.fromFirestoreFormat(val.mapValue);
      }
    }
    return result;
  }

  // Fetch all documents from a collection
  async getCollection<T>(collection: string): Promise<T[]> {
    try {
      const res = await fetch(`${this.baseUrl}/${collection}?pageSize=300`);
      if (!res.ok) return [];
      const json = await res.json();
      if (!json.documents) return [];
      return json.documents.map((doc: any) => this.fromFirestoreFormat(doc)) as T[];
    } catch (e) {
      console.warn(`Firestore getCollection error for ${collection}:`, e);
      return [];
    }
  }

  // Set / Replace document by ID
  async setDocument(collection: string, docId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${collection}/${encodeURIComponent(docId)}`;
      const fields = this.toFirestoreFormat(data);
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      return res.ok;
    } catch (e) {
      console.warn(`Firestore setDocument error for ${collection}/${docId}:`, e);
      return false;
    }
  }

  // Delete document by ID
  async deleteDocument(collection: string, docId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${collection}/${encodeURIComponent(docId)}`;
      const res = await fetch(url, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.warn(`Firestore deleteDocument error for ${collection}/${docId}:`, e);
      return false;
    }
  }
}

export const firestore = isFirebaseConfigured
  ? new FirestoreRestClient(firebaseConfig.projectId)
  : null;
