import { Injectable } from '@nestjs/common';
import { PaginationHelper } from 'src/libs/helpers/pagination.helper';
import { IRavendbPagination } from 'src/libs/ravendb/base/repository.base';
import { RavendbService } from 'src/libs/ravendb/ravendb.service';
import { Company } from './entities/company.entity';
import { CompanyDetailMap, CompanyRepository } from './repo/company.repo';
import { CompanyDTO } from './dto/company.dto';
import { PersonRepository } from '../persons/repo/person.repo';

@Injectable()
export class CompaniesService {
  constructor(private ravendbService: RavendbService) {}

  async pagination(
    pagination: PaginationHelper,
  ): Promise<IRavendbPagination<Company>> {
    const session = this.ravendbService.openSession();
    const companyRepo = new CompanyRepository(session);

    try {
      const builder = companyRepo.builder();
      return builder.pagination(pagination);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async getById(id: string): Promise<CompanyDetailMap> {
    const session = this.ravendbService.openSession();
    const companyRepo = new CompanyRepository(session);

    try {
      const company = await companyRepo.getCompanyDetail(id);

      if (!company) {
        throw new Error(`Company with id: ${id} is not registered`);
      }

      delete company['@metadata'];
      delete company.owner['@metadata'];

      for (const person of company.persons) {
        delete person['@metadata'];
      }

      return company;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async insert(dto: CompanyDTO): Promise<Company> {
    const session = this.ravendbService.openSession();
    const personRepo = new PersonRepository(session);

    try {
      const { name, address, person_ids } = dto;

      const company = new Company();
      company.name = name;
      company.address = address;
      company.owner_id = await this.checkPersonExist(personRepo, dto.owner_id);
      company.person_ids = await this.checkPersonsExist(personRepo, person_ids);

      await session.store(company, company.getId());
      await session.saveChanges();

      return company;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async update(id: string, dto: CompanyDTO): Promise<Company> {
    const session = this.ravendbService.openSession();
    const companyRepo = new CompanyRepository(session);
    const personRepo = new PersonRepository(session);

    try {
      const { name, address, person_ids } = dto;

      const company = await companyRepo.builder().getById(id);

      if (!company) {
        throw new Error(`Company with id: ${id} is not registered`);
      }

      company.name = name;
      company.address = address;
      company.owner_id = await this.checkPersonExist(personRepo, dto.owner_id);
      company.person_ids = await this.checkPersonsExist(personRepo, person_ids);

      await session.saveChanges();

      return company;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async delete(id: string): Promise<Company> {
    const session = this.ravendbService.openSession();
    const companyRepo = new CompanyRepository(session);

    try {
      const company = await companyRepo.builder().getById(id);

      if (!company) {
        throw new Error(`Company with id: ${id} is not registered`);
      }

      await session.delete(company);
      await session.saveChanges();

      return company;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      session.dispose();
    }
  }

  async checkPersonExist(
    personRepo: PersonRepository,
    personId: string,
  ): Promise<string> {
    try {
      const person = await personRepo.builder().getById(personId);

      if (!person) {
        throw new Error(`Person with id: ${personId} is not registered`);
      }

      return personId;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async checkPersonsExist(
    personRepo: PersonRepository,
    ids: string[],
  ): Promise<string[]> {
    try {
      const personIds: string[] = [];

      for (const personId of ids) {
        await this.checkPersonExist(personRepo, personId);
        personIds.push(personId);
      }

      return personIds;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
