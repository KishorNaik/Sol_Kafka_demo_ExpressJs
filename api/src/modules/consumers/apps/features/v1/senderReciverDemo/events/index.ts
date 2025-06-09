import { NotificationData, NotificationHandler, notificationHandler } from 'mediatr-ts';
import { SenderReceiverRequestDto } from '../contracts';
import {
	bullMqRedisConnection,
	delay,
	sealed,
	SenderReceiverConsumerBullMq,
	SenderReceiverConsumerKafka,
} from '@kishornaik/utils';
import { logger } from '@/shared/utils/helpers/loggers';
import { KAFKA_BROKER, RABBITMQ_URL } from '@/config';
import { mediator } from '@/shared/utils/helpers/medaitR';

const consumer = new SenderReceiverConsumerKafka(
	[KAFKA_BROKER],
	'SENDER_RECEIVER_PRODUCER_CLIENT',
	'sender-receiver-demo-topic'
);

export class SenderReceiverIntegrationEventService extends NotificationData {
	private readonly _request: SenderReceiverRequestDto;

	public constructor(request: SenderReceiverRequestDto) {
		super();
		this._request = request;
	}

	public get Request(): SenderReceiverRequestDto {
		return this._request;
	}
}

@sealed
@notificationHandler(SenderReceiverIntegrationEventService)
export class SenderReceiverIntegrationEventServiceHandler
	implements NotificationHandler<SenderReceiverIntegrationEventService>
{
	public async handle(notification: SenderReceiverIntegrationEventService): Promise<void> {
		logger.info(
			`PubSubDemoIntegrationEventServiceHandler`,
			'handle',
			`Request:${JSON.stringify(notification.Request)}`
		);
	}
}

// Event
export const senderReceiverDemoEventListener = async () => {
	await consumer.startConsumingAsync<SenderReceiverRequestDto>(async (message) => {
		console.log(`[App - PubSubConsumer] Received message:`, message.data);
		//await delay(5000);
		await mediator.publish(new SenderReceiverIntegrationEventService(message.data));
		//await delay(5000);
		console.log(`[App - PubSubConsumer] Finished processing message.`);
	});
};
