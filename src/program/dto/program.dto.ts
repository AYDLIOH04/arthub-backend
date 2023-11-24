import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProgramDto {
  name: any;

  link: any;

  systems: any;

  description: any;

  @Type(() => File)
  logo: any;
}
