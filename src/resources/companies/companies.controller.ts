import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  Delete,
  Body,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  IQueryPagination,
  PaginationHelper,
} from 'src/libs/helpers/pagination.helper';
import {
  IOkResponse,
  ISuccessPaginationResponse,
  ISuccessResponse,
  ResponseHelper,
} from 'src/libs/helpers/response.helper';
import { Company } from './entities/company.entity';
import { CompanyDTO } from './dto/company.dto';
import { CompanyDetailMap } from './repo/company.repo';

@Controller('companies')
@ApiTags('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  async get(
    @Query() query: IQueryPagination,
  ): Promise<ISuccessPaginationResponse<Company[]>> {
    const response = new ResponseHelper();

    try {
      const pagination = new PaginationHelper(query);
      const { total, data } = await this.companiesService.pagination(
        pagination,
      );

      return response.successPagination<Company[]>({
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
  async getBydId(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<CompanyDetailMap>> {
    const response = new ResponseHelper();

    try {
      const data = await this.companiesService.getById(id);
      return response.success<CompanyDetailMap>({
        data,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Post()
  async insert(@Body() dto: CompanyDTO): Promise<ISuccessResponse<Company>> {
    const response = new ResponseHelper();

    try {
      const data = await this.companiesService.insert(dto);
      return response.success<Company>({
        data,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CompanyDTO,
  ): Promise<ISuccessResponse<Company>> {
    const response = new ResponseHelper();

    try {
      const data = await this.companiesService.update(id, dto);
      return response.success<Company>({
        data,
      });
    } catch (error) {
      return response.error(error);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<IOkResponse> {
    const response = new ResponseHelper();

    try {
      await this.companiesService.delete(id);
      return response.ok();
    } catch (error) {
      return response.error(error);
    }
  }
}
