export class ErrorCode {
    http: number;
    message: string;

    static LoginFailed = {
        http: 400,
        message: 'Login failed'
    };

    static Forbidden = {
        http: 403,
        message: 'Forbidden'
    };

    static ResourceNotFound = {
        http: 404,
        message: 'Resource not found'
    };

    static ResourceNotAvailable = {
        http: 410,
        message: 'Resource not available'
    };

    static BadRequest = {
        http: 400,
        message: 'Bad Request'
    };

    static InternalServerError = {
        http: 500,
        message: 'Internal Server Error'
    };
}

export interface BusinessErrorResponse {
    code: string;
    message: string;
}

export class BusinessError extends Error {
    readonly code: string;
    readonly short_message: string;
    readonly http_code: number;
    readonly source: ErrorCode;

    static wrap(err: Error | BusinessError): BusinessError {
        return err instanceof BusinessError
            ? err
            : new BusinessError(ErrorCode.InternalServerError, err.message, err.stack);
    }

    constructor(errCode: ErrorCode, logMessage: string, stack?: Error['stack']) {
        super(logMessage);
        this.name = 'BusinessError';
        this.code =
            Object.entries(ErrorCode)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, v]) => v === errCode)
                .map(([k]) => k)
                .pop() || 'InternalServerError';
        this.source = errCode;
        this.short_message = this.code ? errCode.message : ErrorCode.InternalServerError.message;
        this.http_code = this.code ? errCode.http : ErrorCode.InternalServerError.http;
        this.stack = stack;
    }

    toResponse(): BusinessErrorResponse {
        return { code: this.code, message: this.short_message };
    }
}
