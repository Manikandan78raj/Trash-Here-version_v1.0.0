import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: any) => {
        let message = "Operation successful";
        let actualData = data !== undefined ? data : null;
        if (
          data &&
          typeof data === "object" &&
          !Array.isArray(data) &&
          "message" in data
        ) {
          message = data.message;
          if ("data" in data) {
            actualData = data.data;
          } else if (Object.keys(data).length === 1) {
            actualData = null;
          }
        }
        return {
          success: true,
          statusCode,
          message,
          data: actualData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
