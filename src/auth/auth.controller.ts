import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Auth } from './types';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/common/decorators';
import { RefreshTokenGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthDto): Promise<Auth> {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto): Promise<Auth> {
    return this.authService.signin(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
