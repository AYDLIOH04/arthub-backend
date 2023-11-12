
import {Body, Controller, Get, Param} from '@nestjs/common';
import {UsersService} from "./users.service";
import {Public} from "../common/decorators";

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) {
    }
    @Public()
    @Get()
    getAll() {
        return this.userService.getAllUsers()
    }

    @Public()
    @Get(':userId')
    getUser(@Param('userId') userId: string) {
        return this.userService.getUser(userId)
    }

    @Public()
    @Get('delete/:userId')
    deleteUser(@Param('userId') userId: string) {
        return this.userService.deleteUser(userId)
    }
}
