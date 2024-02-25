import { Logger, Service } from '@juneil/lambdi';
import { Feedback } from '../models/feedback.model';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Molder } from '@juneil/lambdi/models';

@Service()
export class FeedbackRepository {
    private readonly TABLE = process.env.TABLE;

    constructor(private readonly dynamo: DynamoDBClient, private readonly logger: Logger) {}

    /**
     * Persist a Feedback object into DynamoDB
     *
     * @param data Feedback
     * @returns Promise<Feedback>
     */
    async create(data: Feedback): Promise<Feedback> {
        const item = { ...data, PK: 'FEEDBACK', SK: `#${data.created_at}` };
        return this.dynamo
            .send(
                new PutCommand({
                    TableName: this.TABLE,
                    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
                    Item: item
                })
            )
            .then(() => Molder.instantiate(Feedback, item))
            .then((res) => (this.logger.debug('New feedback persisted'), res));
    }

    /**
     * Retrieve the list of feedback persisted
     * For this assignment its limited with DynamoDB quotas.
     * We could retrieve all looping through the cursor provided 'LastEvaluatedKey'
     *
     * @returns
     */
    async list(): Promise<Feedback[]> {
        return this.dynamo
            .send(
                new QueryCommand({
                    TableName: this.TABLE,
                    KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                    ExpressionAttributeValues: {
                        ':pk': `FEEDBACK`,
                        ':sk': `#`
                    }
                })
            )
            .then((res) => (res.Items || []).map((item) => Molder.instantiate(Feedback, item)));
    }
}
