import { StatusCodes } from 'http-status-codes';
import {
	Body,
	Get,
	HttpCode,
	JsonController,
	OnUndefined,
	Post,
	Res,
	UseBefore,
} from 'routing-controllers';
import { Response } from 'express';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestData, RequestHandler, requestHandler } from 'mediatr-ts';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import {
	DataResponse as ApiDataResponse,
	bullMqRedisConnection,
	DataResponse,
	DataResponseFactory,
	PubSubMessageKafka,
	PubSubProducerKafka,
	sealed,
	SenderReceiverProducerBullMq,
	SendReceiverMessageBullMq,
} from '@kishornaik/utils';
import { mediator } from '@/shared/utils/helpers/medaitR';
import { Guid } from 'guid-typescript';
import { KAFKA_BROKER, RABBITMQ_URL } from '@/config';
import { PubSubRequestDto, PubSubResponseDto } from '../contracts';

const producer = new PubSubProducerKafka(
	[KAFKA_BROKER],
	'SENDER_RECEIVER_PRODUCER_CLIENT',
	'sender-receiver-demo-topic'
);

@JsonController('/api/v1/pubsub')
@OpenAPI({ tags: ['pubsub'] })
export class ProducerPubSubController {
	@Post()
	@OpenAPI({ summary: 'Pub Sub Demo', tags: ['pubsub'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(PubSubRequestDto))
	public async demoAsync(@Body() request: PubSubRequestDto, @Res() res: Response) {
		const response = await mediator.send(new PubSubCommand(request));
		return res.status(response.StatusCode).json(response);
	}
}

export class PubSubCommand extends RequestData<ApiDataResponse<PubSubResponseDto>> {
	private readonly request: PubSubRequestDto;

	public constructor(request: PubSubRequestDto) {
		super();
		this.request = request;
	}

	public get Request(): PubSubRequestDto {
		return this.request;
	}
}

@sealed
@requestHandler(PubSubCommand)
export class PubSubCommandHandler
	implements RequestHandler<PubSubCommand, DataResponse<PubSubResponseDto>>
{
	public async handle(value: PubSubCommand): Promise<ApiDataResponse<PubSubResponseDto>> {
		try {
			//@guard
			if (!value) return DataResponseFactory.error(StatusCodes.BAD_REQUEST, `value is null`);

			// Consumer Call
			const pubSubMessage: PubSubMessageKafka<PubSubRequestDto> = {
				data: value.Request,
				correlationId: Guid.create().toString(),
			};

			await producer.publishMessageAsync<PubSubRequestDto>(pubSubMessage);

			const response = new PubSubResponseDto();
			response.message = `User created`;

			return DataResponseFactory.success(StatusCodes.OK, response, response.message);
		} catch (ex) {
			const error = ex as Error;
			return DataResponseFactory.error(StatusCodes.BAD_REQUEST, error.message);
		}
	}
}
