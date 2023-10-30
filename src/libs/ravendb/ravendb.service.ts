import { Injectable } from '@nestjs/common';
import DocumentStore, { IDocumentSession } from 'ravendb';

@Injectable()
export class RavendbService {
  private store: DocumentStore;

  constructor() {
    this.store = new DocumentStore('http://localhost:8080/', 'ait');
    this.store.initialize();
  }

  openSession(): IDocumentSession {
    return this.store.openSession();
  }

  async bulkInsert<T extends object>(datas: T[]): Promise<void> {
    const bulk = this.store.bulkInsert();

    for (const data of datas) {
      const rawData = data as any;
      const collection = rawData.getCollectionName() as string;

      rawData.id = `${collection.toLowerCase()}/`;
      const metadata = {
        '@collection': collection,
        isDirty: () => {
          return true;
        },
      };

      await bulk.store(rawData, metadata);
    }

    return bulk.finish();
  }
}
