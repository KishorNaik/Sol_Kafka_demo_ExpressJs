import { ProducerPubSubController } from './apps/features/v1/pubSubDemo';
import { ProducerSenderReceiverController } from './apps/features/v1/senderReciverDemo';

export const producerModules: Function[] = [
	ProducerSenderReceiverController,
	ProducerPubSubController,
];
