import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TutorialDto {
  title: any;

  link: any;

  description: any;

  program: any;

  author: any;

  @Type(() => File)
  image: any;
}
