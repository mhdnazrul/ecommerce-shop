export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} with id '${id}' not found` : `${resource} not found`
    super(msg, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
    this.name = "ConflictError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

export class ValidationError extends AppError {
  public readonly errors: string[]

  constructor(errors: string[]) {
    super("Validation failed", 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
    this.errors = errors
  }
}

export function handleApiError(error: unknown): { message: string; statusCode: number; errors?: string[] } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      errors: error instanceof ValidationError ? error.errors : undefined,
    }
  }

  if (error instanceof Error) {
    const message = process.env.NODE_ENV === "production" ? "Internal server error" : error.message
    return { message, statusCode: 500 }
  }

  return { message: "Internal server error", statusCode: 500 }
}
