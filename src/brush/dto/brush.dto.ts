import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BrushDto {
  title: any;

  link: any;

  description: any;

  program: string;

  @Type(() => File)
  image: any;
}
