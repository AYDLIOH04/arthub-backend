import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/User.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async getUser(userId) {
    return await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
  }

  async deleteUser(userId) {
    return await this.prisma.user.delete({ where: { id: parseInt(userId) } });
  }
}
