import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OutputTutorialDto {
  @ApiProperty({
    example: '1',
    description: 'Уникальный идентификатор',
  })
  id: number;

  @ApiProperty({
    example: '2023-12-01T10:17:56.152Z',
    description: 'Время создания',
  })
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @ApiProperty({
    example: '2023-12-01T10:17:56.152Z',
    description: 'Время обновления данных',
  })
  @IsNotEmpty()
  @IsString()
  updatedAt: string;

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
    example: 'program',
    description: 'Программа, к которой относится туториал',
  })
  @IsNotEmpty()
  @IsString()
  program: string;

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
