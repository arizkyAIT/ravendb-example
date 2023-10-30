import {
  Field,
  IDocumentQuery,
  IDocumentSession,
  PointField,
  SpatialCriteria,
  SpatialCriteriaFactory,
} from 'ravendb';
import { PaginationHelper } from 'src/libs/helpers/pagination.helper';

export interface IRavendbPagination<T extends object> {
  total: number;
  data: T[];
}

export interface IRavendbWhereSpatial {
  latitudeField: string;
  longitudeField: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export class RavendbRepository<T extends object> {
  collectionName: string;
  session: IDocumentSession;
  private documentQuery: IDocumentQuery<T>;
  private whereEqualsData: { fieldName: Field<T>; value: any }[] = [];
  private whereSpatialsData: IRavendbWhereSpatial[] = [];
  private searchFields: string[] = [];
  private fuzzySimilarity = 0;

  constructor(collectionName: string, session: IDocumentSession) {
    this.collectionName = collectionName;
    this.session = session;
  }

  builder(): this {
    this.documentQuery = this.generateDocumentQuery();
    return this;
  }

  whereEquals(fieldName: string, value: any): void {
    this.whereEqualsData.push({ fieldName, value });
  }

  whereSpatials(options: IRavendbWhereSpatial) {
    this.whereSpatialsData.push(options);
  }

  searchPaginations(fields: string[]): void {
    this.searchFields = fields;
  }

  withFuzzy(similarity = 0.5): void {
    this.fuzzySimilarity = similarity;
  }

  async getAll(): Promise<T[]> {
    await this.generateWhereEquals();
    await this.generateWhereSpatials();
    const data = await this.documentQuery.all();

    for (const item of data) {
      delete item['@metadata'];
    }

    return data;
  }

  async getOne(): Promise<T> {
    await this.generateWhereEquals();
    await this.generateWhereSpatials();
    const data = await this.documentQuery.firstOrNull();

    if (data) {
      delete data['@metadata'];
    }

    return data;
  }

  async getById(id: string): Promise<T> {
    const data = await this.documentQuery.whereEquals('id()', id).firstOrNull();

    if (data) {
      delete data['@metadata'];
    }

    return data;
  }

  async pagination(
    pagination: PaginationHelper,
  ): Promise<IRavendbPagination<T>> {
    try {
      let queryTotal = this.generateDocumentQuery();
      let queryData = this.generateDocumentQuery();

      queryTotal = await this.generateWhereEquals(queryTotal);
      queryData = await this.generateWhereEquals(queryData);
      queryTotal = await this.generateWhereSpatials(queryTotal);
      queryData = await this.generateWhereSpatials(queryData);

      const { skip, take, search } = pagination;

      if (search) {
        for (const field of this.searchFields) {
          queryTotal.search(field, search);
          queryData.search(field, search);
        }
      }

      const total = await queryTotal.noTracking().count();
      const data = await queryData.skip(skip).take(take).noTracking().all();

      for (const item of data) {
        delete item['@metadata'];
      }

      return {
        total,
        data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private generateDocumentQuery(): IDocumentQuery<T> {
    return this.session.query({
      collection: this.collectionName,
    });
  }

  private async generateWhereEquals(
    documentQuery: IDocumentQuery<T> = null,
  ): Promise<IDocumentQuery<T>> {
    for (const whereEquals of this.whereEqualsData) {
      const { fieldName, value } = whereEquals;

      if (documentQuery) {
        documentQuery.whereEquals(fieldName, value);
      } else {
        this.documentQuery.whereEquals(fieldName, value);
      }
    }

    if (this.fuzzySimilarity) {
      if (documentQuery) {
        documentQuery.fuzzy(this.fuzzySimilarity);
      } else {
        this.documentQuery.fuzzy(this.fuzzySimilarity);
      }
    }

    if (documentQuery) {
      return documentQuery;
    }
  }

  private async generateWhereSpatials(
    documentQuery: IDocumentQuery<T> = null,
  ): Promise<IDocumentQuery<T>> {
    for (const whereSpatial of this.whereSpatialsData) {
      const { point, criteria } = this.generateSpatial(whereSpatial);

      if (documentQuery) {
        documentQuery.spatial(point, criteria);
      } else {
        this.documentQuery.spatial(point, criteria);
      }
    }

    if (documentQuery) {
      return documentQuery;
    }
  }

  private generateSpatial(whereSpatial: IRavendbWhereSpatial): {
    point: PointField;
    criteria: (data: SpatialCriteriaFactory) => SpatialCriteria;
  } {
    return {
      point: new PointField(
        whereSpatial.latitudeField,
        whereSpatial.longitudeField,
      ),
      criteria: (data: SpatialCriteriaFactory) => {
        return data.withinRadius(
          whereSpatial.radius,
          whereSpatial.latitude,
          whereSpatial.longitude,
        );
      },
    };
  }
}
