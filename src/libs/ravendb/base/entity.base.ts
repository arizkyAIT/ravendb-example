import { generateId } from './lib.base';

export interface IBaseEntity {
  name: string;
}

export class BaseEntity {
  constructor(options: IBaseEntity) {
    this['@metadata']['@collection'] = options.name;
  }

  id: string;

  ['@metadata'] = {
    ['@collection']: '',
  };

  getCollectionName(): string {
    return this['@metadata']['@collection'];
  }

  getId(): string {
    if (this.id) {
      return this.id;
    }

    return generateId(this.getCollectionName());
  }
}
