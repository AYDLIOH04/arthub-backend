import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProgramFullDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  systems: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @Type(() => File)
  logo: string;

  @IsString()
  pluses: string;

  @IsString()
  minuses: string;

  @Type(() => File)
  examples: string;
}
