import { Cors, generateHandler, Lambda, Logger, Payload } from '@juneil/lambdi';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackPayload } from '../../models/feedback.model';
import { createErrorResponse, emptyResponse, Response } from '../../utils/response';

@Lambda({
    providers: [FeedbackService]
})
export class CreateLambda {
    constructor(private readonly logger: Logger, private readonly feedback: FeedbackService) {}

    @Cors('*')
    async onHandler(@Payload data: FeedbackPayload): Promise<Response<void>> {
        return this.feedback
            .create(data)
            .then(() => emptyResponse())
            .catch((err) => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(CreateLambda);
