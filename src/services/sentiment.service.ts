import { Service, InjectionToken, Inject } from '@juneil/lambdi';
import { SentimentAnalyzer, PorterStemmer } from 'natural';
import { FeedbackSentiment } from '../models/feedback.model';

const NATURAL_INJECT = new InjectionToken('natural');

@Service({
    providers: [
        {
            provide: NATURAL_INJECT,
            // instantiate the sentiment analizer
            useFactory: () => {
                const analyser = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
                return analyser;
            }
        }
    ]
})
export class SentimentService {
    constructor(@Inject(NATURAL_INJECT) private readonly analyser: SentimentAnalyzer) {}

    /**
     * Use the library to compute a sentiment score
     *
     * @param content string
     * @returns number
     */
    compute(content: string): number {
        return this.analyser.getSentiment(content.split(' '));
    }

    /**
     * Interpret the score with a simple classification
     *
     * @param score number
     * @returns FeedbackSentiment
     */
    interpret(score: number): FeedbackSentiment {
        if (score > 0) {
            return FeedbackSentiment.Good;
        }
        if (score < 0) {
            return FeedbackSentiment.Bad;
        }
        return FeedbackSentiment.Neutral;
    }
}
