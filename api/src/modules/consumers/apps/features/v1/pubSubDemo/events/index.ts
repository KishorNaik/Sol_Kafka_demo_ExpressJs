import { NotificationData, NotificationHandler, notificationHandler } from 'mediatr-ts';
import {
	bullMqRedisConnection,
	delay,
	sealed,
	SenderReceiverConsumerBullMq,
	PubSubConsumerKafka,
} from '@kishornaik/utils';
import { logger } from '@/shared/utils/helpers/loggers';
import { KAFKA_BROKER, RABBITMQ_URL } from '@/config';
import { mediator } from '@/shared/utils/helpers/medaitR';
import { PubSubRequestDto } from '../contracts';

const consumer = new PubSubConsumerKafka(
	[KAFKA_BROKER],
	'SENDER_RECEIVER_PRODUCER_CLIENT',
	'sender-receiver-demo-topic'
);

export class PubSubIntegrationEventService extends NotificationData {
	private readonly _request: PubSubRequestDto;

	public constructor(request: PubSubRequestDto) {
		super();
		this._request = request;
	}

	public get Request(): PubSubRequestDto {
		return this._request;
	}
}

@sealed
@notificationHandler(PubSubIntegrationEventService)
export class PubSubIntegrationEventServiceHandler
	implements NotificationHandler<PubSubIntegrationEventService>
{
	public async handle(notification: PubSubIntegrationEventService): Promise<void> {
		logger.info(
			`PubSubDemoIntegrationEventServiceHandler`,
			'handle',
			`Request:${JSON.stringify(notification.Request)}`
		);
	}
}

// Event
export const pubSubDemoEventListener = async () => {
	await consumer.subscribeMessageAsync<PubSubRequestDto>(async (message) => {
		console.log(`[App - PubSubConsumer] Received message:`, message.data);
		//await delay(5000);
		await mediator.publish(new PubSubIntegrationEventService(message.data));
		//await delay(5000);
		console.log(`[App - PubSubConsumer] Finished processing message.`);
	});
};
