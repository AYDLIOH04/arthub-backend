import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { TutorialDto } from './dto/tutorial.dto';
import { TutorialService } from './tutorial.service';
import { userInfo } from 'os';
import { FullUserDto } from 'src/user/dto/FullUser.dto';
import { OutputTutorialDto } from './dto/outputTutorial.dto';
import {
  ApiHeader,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { paginatedTutorialsDto } from './dto/paginatedTutorials.dto';

@ApiTags('Туториалы')
@Controller('tutorials')
export class TutorialController {
  constructor(private tutorialService: TutorialService) {}
  @ApiOperation({ summary: 'Создание туториала' })
  @ApiResponse({ status: 200, type: OutputTutorialDto })
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  createBrush(@Body() dto: TutorialDto, @UploadedFile() image) {
    return this.tutorialService.createTutorial(dto, image);
  }

  @ApiOperation({
    summary: 'Добавление или удаление любимого туториала к пользователю',
  })
  @ApiResponse({ status: 200, type: FullUserDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer: ассез токен для авторизации',
  })
  @Post(':referenceID/add-favorite')
  addToUser(
    @Param('referenceID') referenceID: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.tutorialService.addAndRemove(referenceID, userId);
  }

  @ApiOperation({ summary: 'Вывод всех туториалов' })
  @ApiResponse({ status: 200, type: [paginatedTutorialsDto] })
  @Public()
  @Get()
  async showAllTutorials(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
  ) {
    if (program && search && page && size) {
      return await this.tutorialService.sortByProgramAndName(
        program,
        search,
        page,
        size,
      );
    }
    if (program && page && size) {
      return await this.tutorialService.sortByProgram(program, page, size);
    }
    if (search && page && size) {
      return await this.tutorialService.sortByName(search, page, size);
    }
    if (page && size) {
      return await this.tutorialService.showAllTutorials(page, size);
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Вывод всех туториалов с полем favorite' })
  @ApiResponse({ status: 200, type: TutorialDto })
  @Get('/like')
  async showAllLikedTutorials(
    @Query('program') program: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('size') size: string,
    @GetCurrentUserId() userId: number,
  ) {
    if (program && search && page && size) {
      return await this.tutorialService.showLikedByNameAndProgram(
        program,
        search,
        page,
        size,
        userId,
      );
    }
    if (program && page && size) {
      return await this.tutorialService.showLikedByProgram(
        program,
        page,
        size,
        userId,
      );
    }
    if (search && page && size) {
      return await this.tutorialService.showLikedByName(
        search,
        page,
        size,
        userId,
      );
    }
    if (page && size) {
      return await this.tutorialService.showAllLikedTutorials(
        page,
        size,
        userId,
      );
    } else {
      throw new HttpException('Bad request', HttpStatus.NOT_FOUND);
    }
  }

  @ApiOperation({ summary: 'Вывод туториала по ID' })
  @ApiParam({ name: 'tutorialID', description: 'ID туториала' })
  @ApiResponse({ status: 200, type: OutputTutorialDto })
  @Public()
  @Get('/:tutorialID')
  showTutorialByID(@Param('tutorialID') tutorialID: string) {
    return this.tutorialService.showTutorialByID(tutorialID);
  }
}
