import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class FullUserDto {
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
    example: 'bebra@urfu.me',
    description: 'email пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    example: '$2b$10$KHTsfzbqp.TVotKT0u3t6eNcsghneNUUjrrQ6ZfCxeEV3CP.WqsfC',
    description: 'hash',
  })
  @IsNotEmpty()
  @IsString()
  hash: string;

  @ApiProperty({
    example: '$2b$10$tmHHOuhAy6zozjPW14Ih4OR3LsLTeBQa48EibKMLUdya6/VMPG.XS',
    description: 'рефреш токен пользователя',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    example: 'newLogin',
    description: 'логин пользователя',
  })
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'список идентификаторов избранных кистей',
  })
  @IsNotEmpty()
  @IsString()
  brushes: [number];

  @ApiProperty({
    example: [1, 2, 3],
    description: 'список идентификаторов избранных туториалов',
  })
  @IsNotEmpty()
  @IsString()
  tutorials: [number];

  @ApiProperty({
    example: [1, 2, 3],
    description: 'список идентификаторов избранных программ',
  })
  @IsNotEmpty()
  @IsString()
  programs: [number];
}
