import { Type } from 'class-transformer';

export class ReferenceDto {
  title: any;

  hashtag: any;

  @Type(() => File)
  image: any;
}
