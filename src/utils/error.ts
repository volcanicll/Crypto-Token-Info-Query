export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleError(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof APIError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    status: 500,
  };
}
