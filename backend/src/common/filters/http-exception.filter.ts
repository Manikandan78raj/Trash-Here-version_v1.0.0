import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    const message =
      typeof exceptionResponse === "object" &&
      "message" in (exceptionResponse as any)
        ? (exceptionResponse as any).message
        : exceptionResponse;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `🔥 [${request.method}] ${request.url} - Error:`,
        exception,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      error:
        typeof exceptionResponse === "object" &&
        "error" in (exceptionResponse as any)
          ? (exceptionResponse as any).error
          : exception instanceof Error
            ? exception.name
            : "Error",
    });
  }
}
