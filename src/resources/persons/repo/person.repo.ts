import { IDocumentSession } from 'ravendb';
import { PERSON_COLLECTION_NAME, Person } from '../entities/person.entity';
import { RavendbRepository } from 'src/libs/ravendb/base/repository.base';

export class PersonRepository extends RavendbRepository<Person> {
  constructor(session: IDocumentSession) {
    super(PERSON_COLLECTION_NAME, session);
  }
}
