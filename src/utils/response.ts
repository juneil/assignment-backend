import { APIGatewayProxyResponse, Logger } from '@juneil/lambdi';
import { BusinessError, BusinessErrorResponse, ErrorCode } from './error';

export function E<E extends object>(enumValue: E): string[] {
    return Object.values(enumValue);
}

export function createResponse<T>(body: T): APIGatewayProxyResponse<T> {
    return {
        statusCode: 200,
        body
    };
}

export function emptyResponse(): APIGatewayProxyResponse<void> {
    return {
        statusCode: 201,
        body: undefined
    };
}

export function createErrorResponse(
    error: Error,
    logger: Logger
): APIGatewayProxyResponse<BusinessErrorResponse> {
    const e = BusinessError.wrap(error);
    logger.error(e);
    return { statusCode: e.http_code, body: e.toResponse() };
}

export type Response<T> = APIGatewayProxyResponse<T | BusinessErrorResponse>;
