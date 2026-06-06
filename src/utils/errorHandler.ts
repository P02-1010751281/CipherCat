export type ErrorType =
  | 'WORKSPACE_ERROR'
  | 'FILE_ERROR'
  | 'GENERATOR_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  timestamp: Date;
  details?: unknown;
}

type ErrorListener = (_error: AppError) => void;

class ErrorHandler {
  private static instance: ErrorHandler;
  private listeners: ErrorListener[] = [];
  private errors: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  addListener(listener: ErrorListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch {
        // Ignore listener errors
      }
    });
  }

  handleError(type: ErrorType, message: string, details?: unknown): AppError {
    const error: AppError = {
      type,
      message,
      timestamp: new Date(),
      details,
    };

    this.errors.push(error);
    console.error(`[${type}] ${message}`, details || '');
    this.notify(error);

    return error;
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  handleFileError(operation: string, error: unknown): AppError {
    const message = error instanceof Error ? error.message : String(error);
    return this.handleError(
      'FILE_ERROR',
      `${operation}失败: ${message}`,
      error,
    );
  }

  handleWorkspaceError(operation: string, error: unknown): AppError {
    const message = error instanceof Error ? error.message : String(error);
    return this.handleError(
      'WORKSPACE_ERROR',
      `工作空间${operation}失败: ${message}`,
      error,
    );
  }

  handleGeneratorError(language: string, error: unknown): AppError {
    const message = error instanceof Error ? error.message : String(error);
    return this.handleError(
      'GENERATOR_ERROR',
      `${language}代码生成失败: ${message}`,
      error,
    );
  }
}

export const errorHandler = ErrorHandler.getInstance();

export function safeExecute<T>(
  fn: () => T,
  errorHandlerFn?: (_error: unknown) => void,
): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (errorHandlerFn) {
      errorHandlerFn(error);
    } else {
      errorHandler.handleError('UNKNOWN_ERROR', '操作失败', error);
    }
    return undefined;
  }
}

export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  errorHandlerFn?: (_error: unknown) => void,
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandlerFn) {
      errorHandlerFn(error);
    } else {
      errorHandler.handleError('UNKNOWN_ERROR', '异步操作失败', error);
    }
    return undefined;
  }
}
