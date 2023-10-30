import { BaseEntity } from 'src/libs/ravendb/base/entity.base';

export const COMPANY_COLLECTION_NAME = 'Companies';

export class Company extends BaseEntity {
  constructor() {
    super({ name: COMPANY_COLLECTION_NAME });
  }

  name: string;
  address: string;
  owner_id: string;
  person_ids: string[];
}
