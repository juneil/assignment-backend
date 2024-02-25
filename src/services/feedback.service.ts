import { Service } from '@juneil/lambdi';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { Feedback, FeedbackPayload } from '../models/feedback.model';
import { SentimentService } from './sentiment.service';
import { Molder } from '@juneil/lambdi/models';

@Service({
    providers: [FeedbackRepository, SentimentService]
})
export class FeedbackService {
    constructor(
        private readonly repository: FeedbackRepository,
        private readonly sentiment: SentimentService
    ) {}

    /**
     * Create and persist a feedback from a payload object.
     * It will use a Sentiment Analyser to add a sentiment value on the content.
     *
     * @param data FeedbackPayload
     * @returns Promise<Feedback>
     */
    async create(data: FeedbackPayload): Promise<Feedback> {
        const score = this.sentiment.compute(data.content);
        return Promise.resolve(data)
            .then((data) => ({
                ...data,
                created_at: Date.now(),
                sentiment_value: score,
                sentiment: this.sentiment.interpret(score)
            }))
            .then((data) => Molder.instantiate(Feedback, data))
            .then((data) => this.repository.create(data));
    }

    /**
     * Retrieve the list of feedbacks from repository
     *
     * @returns
     */
    async list(): Promise<Feedback[]> {
        return this.repository.list();
    }
}
