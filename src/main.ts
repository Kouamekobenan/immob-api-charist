import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    "https://immob-api-charist-production.up.railway.app",
    'https://immob-six.vercel.app',
    'https://localhost',
    'app://',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('Origin bloquée par CORS :', origin); // pour debug dans les logs Railway
        callback(null, false); // refus propre, pas d'exception -> pas de 500
      }
    },
    credentials: true, // nécessaire si vous envoyez cookies ou Authorization avec credentials
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Immob API')
    .setDescription(
      `API de gestion immobilière.

**Modules disponibles :**
- 🔐 Authentification (register, login, logout, refresh token, mot de passe oublié)
- 🏠 Biens immobiliers (properties)
- 📄 Contrats de location (contracts)
- 🔧 Tickets de maintenance (tickets)
- 💳 Paiements (payments)
- 📋 Journaux d'audit (audit-logs)`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Saisir le token JWT (access token)',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(
    `\n🚀  Application démarrée sur : http://localhost:${port}/api/v1`,
  );
  console.log(
    `📚  Documentation Swagger  : http://localhost:${port}/api/docs\n`,
  );
}

bootstrap();
