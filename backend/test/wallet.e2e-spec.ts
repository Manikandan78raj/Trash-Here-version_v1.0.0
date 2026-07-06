import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { HttpExceptionFilter } from "./../src/common/filters/http-exception.filter";
import { TransformInterceptor } from "./../src/common/interceptors/transform.interceptor";

describe("Wallet API Endpoints (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("/api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api/v1/wallet (GET) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer()).get("/api/v1/wallet").expect(401);
  });

  it("/api/v1/wallet/dashboard (GET) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer())
      .get("/api/v1/wallet/dashboard")
      .expect(401);
  });

  it("/api/v1/wallet/rewards (GET) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer())
      .get("/api/v1/wallet/rewards")
      .expect(401);
  });

  it("/api/v1/wallet/coupons (GET) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer())
      .get("/api/v1/wallet/coupons")
      .expect(401);
  });

  it("/api/v1/wallet/subscriptions/current (GET) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer())
      .get("/api/v1/wallet/subscriptions/current")
      .expect(401);
  });

  it("/api/v1/wallet/withdraw (POST) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer())
      .post("/api/v1/wallet/withdraw")
      .send({ amount: 50.0 })
      .expect(401);
  });
});
