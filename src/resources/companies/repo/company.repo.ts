import { RavendbRepository } from 'src/libs/ravendb/base/repository.base';
import { COMPANY_COLLECTION_NAME, Company } from '../entities/company.entity';
import { IDocumentSession } from 'ravendb';
import { Person } from 'src/resources/persons/entities/person.entity';

export class CompanyRepository extends RavendbRepository<Company> {
  constructor(session: IDocumentSession) {
    super(COMPANY_COLLECTION_NAME, session);
  }

  async getCompanyDetail(id: string): Promise<CompanyDetailMap> {
    return this.session.advanced
      .rawQuery(
        `from "${COMPANY_COLLECTION_NAME}" as c
        where id() == '${id}'
        load c.owner_id as o, c.person_ids as p[]
        select {
          id: c["@metadata"]["@id"],
          name: c.name,
          address: c.address,
          owner: o,
          persons: p,
        }
      `,
        CompanyDetailMap,
      )
      .firstOrNull();
  }
}

export class CompanyDetailMap {
  id: string;
  name: string;
  address: string;
  owner: Person;
  persons: Person[];
  ['@metadata']: any;
}
