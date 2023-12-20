import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReferenceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  hashtag: string;

  @Type(() => File)
  image: string;
}
