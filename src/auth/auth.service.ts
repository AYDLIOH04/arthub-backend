import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Auth, Refresh, Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(dto: AuthDto): Promise<Auth> {
    const hash = await this.hashData(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
        login: dto.login,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      email: newUser.email,
    };
  }

  async signin(dto: AuthDto): Promise<Auth> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Пользователь не найден');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);

    if (!passwordMatches) throw new ForbiddenException('Неверный пароль');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      email: user.email,
    };
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Refresh> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new ForbiddenException('Пользователь не найден');
    if (!user.refreshToken)
      throw new ForbiddenException('Пользователь не авторизован');

    const rtMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Доступ запрещен');

    const token = await this.getNewAccessToken(user.id, user.email);
    return {
      access_token: token,
      email: user.email,
    };
  }

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async getTokens(userId: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: 60 * 60,
        },
      ),
      this.jwt.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: 7 * 24 * 60 * 60,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async getNewAccessToken(
    userId: number,
    email: string,
  ): Promise<string> {
    const accessToken = this.jwt.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: 60 * 60,
      },
    );

    return accessToken;
  }

  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hash,
      },
    });

    return hash;
  }
}
