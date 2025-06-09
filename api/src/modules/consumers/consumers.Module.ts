import { pubSubDemoEventListener } from './apps/features/v1/pubSubDemo';
import { senderReceiverDemoEventListener } from './apps/features/v1/senderReciverDemo/events';
import { kafkaRunner } from '@/shared/utils/helpers/kafka';

export const consumerModules: Function[] = [];
kafkaRunner.registerWorker(senderReceiverDemoEventListener);
kafkaRunner.registerWorker(pubSubDemoEventListener);
