import { Required, Max, ExtendRules, Enum, Item, Simple } from '@juneil/lambdi/models';
import { E } from '../utils/response';

export enum FeedbackSentiment {
    Good = 'good',
    Neutral = 'neutral',
    Bad = 'bad'
}

export class FeedbackPayload {
    @Required @Max(50) firstname: string;
    @Required @Max(50) lastname: string;
    @Required @Max(1000) content: string;
}

@ExtendRules(FeedbackPayload)
export class Feedback extends FeedbackPayload {
    @Required sentiment_value: number;
    @Required @Enum(...E(FeedbackSentiment)) sentiment: FeedbackSentiment;
    @Required created_at: number;
}

export class FeedbackListResponse {
    @Required @Item(Feedback) feedbacks: Feedback[];
}

export class AuthHeader {
    @Required Authorization: string;
}
