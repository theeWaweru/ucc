// lib/api-utils.ts
import { NextResponse } from "next/server";

// Standard API response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
};

// Error types for better categorization
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SERVER_ERROR = "SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
}

// HTTP status codes for responses
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
};

/**
 * Creates a standardized successful API response
 * @param data The data to return
 * @param message Optional success message
 * @param status HTTP status code (defaults to 200)
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Creates a standardized error API response
 * @param error Error message or object
 * @param status HTTP status code (defaults to 400)
 * @param errorType Type of error for categorization
 */
export function errorResponse(
  error: string | Error,
  status: number = HttpStatus.BAD_REQUEST,
  errorType?: ErrorType
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      errorType: errorType || getErrorTypeFromStatus(status),
    },
    { status }
  );
}

/**
 * Maps HTTP status codes to error types
 * @param status HTTP status code
 */
function getErrorTypeFromStatus(status: number): ErrorType {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorType.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return ErrorType.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorType.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorType.NOT_FOUND;
    case HttpStatus.VALIDATION_ERROR:
      return ErrorType.VALIDATION;
    default:
      return ErrorType.SERVER_ERROR;
  }
}

/**
 * Helper function to handle async route handlers with proper error handling
 * @param handler The async route handler function
 */
export function withErrorHandling(
  handler: (req: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        return errorResponse(
          error.message,
          HttpStatus.SERVER_ERROR,
          ErrorType.SERVER_ERROR
        );
      }

      return errorResponse(
        "An unexpected error occurred",
        HttpStatus.SERVER_ERROR,
        ErrorType.SERVER_ERROR
      );
    }
  };
}

/**
 * Helper function to validate request data
 * @param data The data to validate
 * @param schema The validation schema (e.g., Zod schema)
 */
export function validateRequest<T>(data: any, schema: any): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("Validation error:", error);
    return null;
  }
}

/**
 * Validates request method against allowed methods
 * @param request The incoming request
 * @param allowedMethods Array of allowed HTTP methods
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): boolean {
  const method = request.method.toUpperCase();
  return allowedMethods.includes(method);
}

/**
 * Helper function for API pagination
 * @param page The page number
 * @param limit Items per page
 */
export function getPaginationParams(
  page: string | number = 1,
  limit: string | number = 10
) {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
}

/**
 * Create a paginated response with standardized format
 * @param data The data array for the current page
 * @param total Total number of items
 * @param page Current page number
 * @param limit Items per page
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<
  ApiResponse<{
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>
> {
  const pages = Math.ceil(total / limit);

  return successResponse({
    items: data,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  });
}
