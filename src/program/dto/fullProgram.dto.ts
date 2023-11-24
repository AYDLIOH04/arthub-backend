import { Type } from 'class-transformer';

export class ProgramFullDto {
  name: any;

  link: any;

  systems: any;

  description: any;

  @Type(() => File)
  logo: any;

  pluses: any;

  minuses: any;

  @Type(() => File)
  examples: any;
}
