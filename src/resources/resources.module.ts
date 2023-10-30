import { Module } from '@nestjs/common';
import { PersonsModule } from './persons/persons.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [PersonsModule, CompaniesModule],
})
export class ResourcesModule {}
