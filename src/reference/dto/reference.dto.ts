import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReferenceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  hashtag: string;

  @IsNotEmpty()
  @IsString()
  @Type(() => File)
  image: string;
}
