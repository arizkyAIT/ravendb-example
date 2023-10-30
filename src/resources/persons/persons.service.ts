import { Injectable } from '@nestjs/common';
import { RavendbService } from 'src/libs/ravendb/ravendb.service';
import { Person } from './entities/person.entity';
import { faker } from '@faker-js/faker';
import { LogHelper } from 'src/libs/helpers/log.helper';
import { PaginationHelper } from 'src/libs/helpers/pagination.helper';
import { PersonRepository } from './repo/person.repo';
import { PersonDTO } from './dto/person.dto';
import { IRavendbPagination } from 'src/libs/ravendb/base/repository.base';
import * as moment from 'moment';
import { SeedPersonDTO } from './dto/seed-person.dto';
import { IPersonFilter } from './interfaces/person-filter.interface';

@Injectable()
export class PersonsService {
  constructor(private ravendbService: RavendbService) {}

  async pagination(
    pagination: PaginationHelper,
    filter: IPersonFilter,
  ): Promise<IRavendbPagination<Person>> {
    const session = this.ravendbService.openSession();
    const personRepo = new PersonRepository(session);

    try {
      const builder = personRepo.builder();
      builder.searchPaginations(['firstname', 'lastname']);

      /* where clause with fuzzy
      builder.whereEquals('firstname', 'casye');
      builder.withFuzzy();
      */

      const { latitude, longitude, radius } = filter;

      if (latitude && longitude && radius) {
        builder.whereSpatials({
          latitudeField: 'latitude',
          longitudeField: 'longitude',
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius),
        });
      }

      return builder.pagination(pagination);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async getById(id: string): Promise<Person> {
    const session = this.ravendbService.openSession();
    const personRepo = new PersonRepository(session);

    try {
      const person = await personRepo.builder().getById(id);

      if (!person) {
        throw new Error(`Person with id: ${id} is not registered`);
      }

      return person;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async insert(dto: PersonDTO): Promise<Person> {
    const session = this.ravendbService.openSession();

    try {
      const {
        firstname,
        lastname,
        gender,
        dob,
        country,
        latitude,
        longitude,
        connections,
      } = dto;

      const person = new Person();
      person.firstname = firstname;
      person.lastname = lastname;
      person.gender = gender;
      person.dob = moment(dob).toDate();
      person.country = country;
      person.latitude = latitude;
      person.longitude = longitude;
      person.connections = connections;

      await session.store(person, person.getId());
      await session.saveChanges();

      return person;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async update(id: string, dto: PersonDTO): Promise<Person> {
    const session = this.ravendbService.openSession();
    const personRepo = new PersonRepository(session);

    try {
      const {
        firstname,
        lastname,
        gender,
        dob,
        country,
        latitude,
        longitude,
        connections,
      } = dto;

      const person = await personRepo.builder().getById(id);

      if (!person) {
        throw new Error(`Person with id: ${id} is not registered`);
      }

      person.firstname = firstname;
      person.lastname = lastname;
      person.gender = gender;
      person.dob = moment(dob).toDate();
      person.country = country;
      person.latitude = latitude;
      person.longitude = longitude;
      person.connections = connections;

      await session.saveChanges();

      return person;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async delete(id: string): Promise<Person> {
    const session = this.ravendbService.openSession();
    const personRepo = new PersonRepository(session);

    try {
      const person = await personRepo.builder().getById(id);

      if (!person) {
        throw new Error(`Person with id: ${id} is not registered`);
      }

      await session.delete(person);
      await session.saveChanges();

      return person;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async addConnection(id: string, personId: string): Promise<Person> {
    const session = this.ravendbService.openSession();
    const personRepo = new PersonRepository(session);

    try {
      const person = await personRepo.builder().getById(id);

      if (!person) {
        throw new Error(`Person with id: ${id} is not registered`);
      }

      person.connections.push(personId);

      await session.saveChanges();

      return person;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async seedPersons(dto: SeedPersonDTO): Promise<string> {
    try {
      const logHelper = new LogHelper();
      logHelper.start();

      const persons: Person[] = [];
      let row = 1;
      while (row <= dto.total_persons) {
        const person = this.generatePerson();
        persons.push(person);

        console.log(`Row generated: ${row}`);

        row++;
      }

      await this.ravendbService.bulkInsert<Person>(persons);

      return `Total seconds: ${logHelper.end()}`;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private generatePerson(): Person {
    const gender = faker.person.sexType();

    const person = new Person();
    person.firstname = faker.person.firstName(gender);
    person.lastname = faker.person.lastName(gender);
    person.gender = gender;
    person.dob = faker.date.birthdate({ min: 20, max: 65, mode: 'age' });
    person.country = faker.location.country();
    person.latitude = faker.location.latitude();
    person.longitude = faker.location.longitude();
    person.connections = [];

    return person;
  }
}
