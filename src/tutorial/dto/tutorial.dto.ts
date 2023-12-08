import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TutorialDto {
  @ApiProperty({
    example: 'title',
    description: 'Уникальное название туториала',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'link', description: 'Уникальная ссылка' })
  @IsNotEmpty()
  @IsString()
  link: string;

  @ApiProperty({ example: 'description', description: 'Описание' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'difficulty',
    description: 'Уровень сложности туториала',
  })
  @IsNotEmpty()
  @IsString()
  difficulty: string;

  @ApiProperty({ example: 'author', description: 'Автор туториала' })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    example: 'S122x122Fit_2x.webp',
    description: 'Графический файл',
  })
  @Type(() => File)
  image: string;
}
