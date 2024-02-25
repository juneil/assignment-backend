import 'jest';
import { extractMetadataFromService } from '@juneil/lambdi/metadata';
import { DependencyInjection } from '@juneil/lambdi/di';
import { SentimentService } from '../src/services/sentiment.service';
import { FeedbackSentiment } from '../src/models/feedback.model';
import { Provider } from '@juneil/lambdi';

describe('Customer file parsing', () => {
    let svc: SentimentService;
    beforeEach(() => {
        const providers = extractMetadataFromService(SentimentService).providers as Provider[];
        const di = DependencyInjection.createAndResolve([...providers, SentimentService]);
        svc = di.get(SentimentService);
    });

    it('should have a good sentiment', () => {
        const content = 'This a really good content';
        const score = svc.compute(content);
        expect(svc.interpret(score)).toBe(FeedbackSentiment.Good);
    });

    it('should have a bas sentiment', () => {
        const content = 'This a really bad content';
        const score = svc.compute(content);
        expect(svc.interpret(score)).toBe(FeedbackSentiment.Bad);
    });

    it('should have a neutral sentiment', () => {
        const content = 'This is a content';
        const score = svc.compute(content);
        expect(svc.interpret(score)).toBe(FeedbackSentiment.Neutral);
    });
});
