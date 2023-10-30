import { Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { RavendbModule } from 'src/libs/ravendb/ravendb.module';

@Module({
  imports: [RavendbModule],
  controllers: [PersonsController],
  providers: [PersonsService],
})
export class PersonsModule {}
