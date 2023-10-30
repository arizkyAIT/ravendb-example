import { BaseEntity } from 'src/libs/ravendb/base/entity.base';

export const PERSON_COLLECTION_NAME = 'Persons';

export class Person extends BaseEntity {
  constructor() {
    super({ name: PERSON_COLLECTION_NAME });
  }

  firstname: string;
  lastname: string;
  gender: 'female' | 'male';
  dob: Date;
  country: string;
  latitude: number;
  longitude: number;
  connections: string[];
}
