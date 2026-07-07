import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import * as compression from "compression";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const logger = new Logger("TrashHereEnterprise");
  const app = await NestFactory.create(AppModule);

  // 1. Security, Compression & Helmet Middleware
  app.use(helmet());
  app.use((compression as any)({ threshold: 1024 })); // Compress responses > 1KB (Gzip/Brotli)
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // 2. Global Prefix & Versioning
  const apiPrefix = process.env.API_PREFIX || "/api/v1";
  app.setGlobalPrefix(apiPrefix);

  // 3. Global Pipes, Filters & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 4. Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle("Trash Here — Enterprise API")
    .setDescription(
      "AI-Powered Smart Waste Management Platform API connecting Households, Collectors, and Recycling Companies. Built to Google Staff Engineer standards.",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    customSiteTitle: "Trash Here API Docs",
    customCss:
      ".swagger-ui .topbar { background-color: #111111; } .swagger-ui .topbar .link { color: #D7FF43; font-weight: bold; }",
  });

  // 5. Start Server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(
    `🚀 Trash Here Enterprise Backend listening on: http://localhost:${port}${apiPrefix}`,
  );
  logger.log(
    `📚 Swagger API Documentation available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
