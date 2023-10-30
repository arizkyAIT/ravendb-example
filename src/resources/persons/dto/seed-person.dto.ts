import { IsNotEmpty, IsNumber } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SeedPersonDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  total_persons: number;
}
