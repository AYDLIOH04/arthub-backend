import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const cofig = new DocumentBuilder()
    .setTitle('ArtHub')
    .setDescription('Документация')
    .setVersion('1.0.0')
    .addTag('backend')
    .build();
  const document = SwaggerModule.createDocument(app, cofig);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
