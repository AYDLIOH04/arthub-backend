import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProgramDto {
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
}
