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
import {ServeStaticModule} from "@nestjs/serve-static";
import { ReferenceModule } from './reference/reference.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { TutorialController } from './tutorial/tutorial.controller';
import { ProgrammModule } from './programm/programm.module';
import { ProgrammController } from './programm/programm.controller';
import * as path from "path"
import {TutorialService} from "./tutorial/tutorial.service";
import {ProgrammService} from "./programm/programm.service";
import {ReferenceService} from "./reference/reference.service";

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, BrushModule, FilesModule, TutorialModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
    }),
    ReferenceModule,
    ProgrammModule,
    TutorialModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
      ProgrammService,
      BrushService,
      TutorialService,
      ReferenceService

  ],
  controllers: [BrushController, TutorialController, ProgrammController],
})
export class AppModule {}
