import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../common/decorators';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Public()
  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  @Public()
  @Get('ref_tag')
  sortReferenceByHashtag(
    @Query('tag') hashtag: string,
    @Query('userID') userID: string,
  ) {
    return this.userService.sortReferenceByHashtag(hashtag, userID);
  }

  @Public()
  @Get('ref_name')
  sortReferenceByName(
    @Query('name') name: string,
    @Query('userID') userID: string,
  ) {
    return this.userService.sortReferenceByTitle(name, userID);
  }

  @Public()
  @Get('brush_prog')
  sortBrushByProgram(
    @Query('program') program: string,
    @Query('userID') userID: string,
  ) {
    return this.userService.sortBrushByProgramm(program, userID);
  }

  @Public()
  @Get(':userId')
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Public()
  @Get('delete/:userId')
  deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
