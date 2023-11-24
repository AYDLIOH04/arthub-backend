import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccessTokenGuard } from './common/guards';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { BrushController } from './brush/brush.controller';
import { BrushService } from './brush/brush.service';
import { BrushModule } from './brush/brush.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ReferenceModule } from './reference/reference.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { TutorialController } from './tutorial/tutorial.controller';
import { ProgramModule } from './program/program.module';
import { ProgramController } from './program/program.controller';
import * as path from 'path';
import { TutorialService } from './tutorial/tutorial.service';
import { ProgramService } from './program/program.service';
import { ReferenceService } from './reference/reference.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    BrushModule,
    FilesModule,
    TutorialModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
    }),
    ReferenceModule,
    ProgramModule,
    TutorialModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    ProgramService,
    BrushService,
    TutorialService,
    ReferenceService,
  ],
  controllers: [BrushController, TutorialController, ProgramController],
})
export class AppModule {}
