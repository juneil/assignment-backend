import { ApiResponse, Cors, generateHandler, Lambda, Logger, Headers } from '@juneil/lambdi';
import { FeedbackService } from '../../services/feedback.service';
import { AuthHeader, FeedbackListResponse } from '../../models/feedback.model';
import { createErrorResponse, createResponse, Response } from '../../utils/response';

@Lambda({
    providers: [FeedbackService]
})
export class ListLambda {
    constructor(private readonly logger: Logger, private readonly feedback: FeedbackService) {}

    @Cors('*')
    @ApiResponse(FeedbackListResponse)
    async onHandler(@Headers _: AuthHeader): Promise<Response<FeedbackListResponse>> {
        return this.feedback
            .list()
            .then((res) => createResponse({ feedbacks: res }))
            .catch((err) => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(ListLambda);
