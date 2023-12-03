import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { TutorialDto } from './tutorial.dto';

export class paginatedTutorialsDto {
  @ApiProperty({
    example: [TutorialDto],
    description: 'Список туториалов',
  })
  response: [TutorialDto];

  @ApiProperty({
    example: '100',
    description: 'Число туториалов в списке',
  })
  @IsNotEmpty()
  @IsString()
  totalCount: number;
}
