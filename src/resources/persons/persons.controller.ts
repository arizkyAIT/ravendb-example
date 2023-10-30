import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  IOkResponse,
  ISuccessPaginationResponse,
  ISuccessResponse,
  ResponseHelper,
} from 'src/libs/helpers/response.helper';
import { Person } from './entities/person.entity';
import {
  IQueryPagination,
  PaginationHelper,
} from 'src/libs/helpers/pagination.helper';
import { PersonDTO } from './dto/person.dto';
import { SeedPersonDTO } from './dto/seed-person.dto';
import { IPersonFilter } from './interfaces/person-filter.interface';

@Controller('persons')
@ApiTags('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get()
  @ApiQuery({ name: 'radius', required: false })
  @ApiQuery({ name: 'longitude', required: false })
  @ApiQuery({ name: 'latitude', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  async get(
    @Query() query: IQueryPagination & IPersonFilter,
  ): Promise<ISuccessPaginationResponse<Person[]>> {
    const response = new ResponseHelper();

    try {
      const pagination = new PaginationHelper(query);
      const { latitude, longitude, radius } = query;
      const filter: IPersonFilter = {
        latitude,
        longitude,
        radius,
      };

      const { total, data } = await this.personsService.pagination(
        pagination,
        filter,
      );

      return response.successPagination<Person[]>({
        data,
        paginations: {
          take: pagination.take,
          page: pagination.page,
          total,
        },
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Get(':id')
  async getBydId(@Param('id') id: string): Promise<ISuccessResponse<Person>> {
    const response = new ResponseHelper();

    try {
      const person = await this.personsService.getById(id);
      return response.success<Person>({
        data: person,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Post()
  async insert(@Body() dto: PersonDTO): Promise<ISuccessResponse<Person>> {
    const response = new ResponseHelper();

    try {
      const person = await this.personsService.insert(dto);
      return response.success<Person>({
        data: person,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: PersonDTO,
  ): Promise<ISuccessResponse<Person>> {
    const response = new ResponseHelper();

    try {
      const person = await this.personsService.update(id, dto);
      return response.success<Person>({
        data: person,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<IOkResponse> {
    const response = new ResponseHelper();

    try {
      await this.personsService.delete(id);
      return response.ok();
    } catch (error) {
      return response.error(error);
    }
  }

  @Patch(':id/connections/:personId')
  async addConnection(
    @Param('id') id: string,
    @Param('personId') personId: string,
  ): Promise<ISuccessResponse<Person>> {
    const response = new ResponseHelper();

    try {
      const person = await this.personsService.addConnection(id, personId);
      return response.success<Person>({
        data: person,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Post('seeds')
  async seedPersons(@Body() dto: SeedPersonDTO): Promise<IOkResponse> {
    const response = new ResponseHelper();

    try {
      const message = await this.personsService.seedPersons(dto);
      return response.ok(message);
    } catch (error) {
      return response.error(error);
    }
  }
}
