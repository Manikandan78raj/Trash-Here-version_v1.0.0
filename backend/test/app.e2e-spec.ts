import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { HttpExceptionFilter } from "./../src/common/filters/http-exception.filter";
import { TransformInterceptor } from "./../src/common/interceptors/transform.interceptor";

describe("App API Endpoints (e2e)", () => {
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

  it("/api/v1/waste-categories (GET) - should return active categories", () => {
    return request(app.getHttpServer())
      .get("/api/v1/waste-categories")
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it("/api/v1/users/profile (GET) - should return 401 Unauthorized without JWT", () => {
    return request(app.getHttpServer())
      .get("/api/v1/users/profile")
      .expect(401);
  });

  it("/api/v1/auth/login (POST) - should return 401 for invalid login", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: "nonexistent@trashhere.com",
        password: "WrongPassword123!",
      })
      .expect(401);
  });
});
