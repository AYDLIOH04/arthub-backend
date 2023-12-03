import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BrushDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  program: string;

  @Type(() => File)
  image: string;
}
