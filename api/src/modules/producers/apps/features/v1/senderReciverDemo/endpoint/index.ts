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
	sealed,
	SenderReceiverMessageKafka,
	SenderReceiverProducerBullMq,
	SenderReceiverProducerKafka,
	SendReceiverMessageBullMq,
} from '@kishornaik/utils';
import { mediator } from '@/shared/utils/helpers/medaitR';
import { SenderReceiverRequestDto, SenderReceiverResponseDto } from '../contracts';
import { Guid } from 'guid-typescript';
import { KAFKA_BROKER, RABBITMQ_URL } from '@/config';

const producer = new SenderReceiverProducerKafka(
	[KAFKA_BROKER],
	'SENDER_RECEIVER_PRODUCER_CLIENT',
	'sender-receiver-demo-topic'
);

@JsonController('/api/v1/senderreceiver')
@OpenAPI({ tags: ['senderreceiver'] })
export class ProducerSenderReceiverController {
	@Post()
	@OpenAPI({ summary: 'Pub Sub Demo', tags: ['senderreceiver'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(SenderReceiverRequestDto))
	public async demoAsync(@Body() request: SenderReceiverRequestDto, @Res() res: Response) {
		const response = await mediator.send(new SenderReceiverCommand(request));
		return res.status(response.StatusCode).json(response);
	}
}

export class SenderReceiverCommand extends RequestData<ApiDataResponse<SenderReceiverResponseDto>> {
	private readonly request: SenderReceiverRequestDto;

	public constructor(request: SenderReceiverRequestDto) {
		super();
		this.request = request;
	}

	public get Request(): SenderReceiverRequestDto {
		return this.request;
	}
}

@sealed
@requestHandler(SenderReceiverCommand)
export class SenderReceiverCommandHandler
	implements RequestHandler<SenderReceiverCommand, DataResponse<SenderReceiverResponseDto>>
{
	public async handle(
		value: SenderReceiverCommand
	): Promise<ApiDataResponse<SenderReceiverResponseDto>> {
		try {
			//@guard
			if (!value) return DataResponseFactory.error(StatusCodes.BAD_REQUEST, `value is null`);

			// Consumer Call
			const pubSubMessage: SenderReceiverMessageKafka<SenderReceiverRequestDto> = {
				data: value.Request,
				correlationId: Guid.create().toString(),
			};

			await producer.sendAsync<SenderReceiverRequestDto>(pubSubMessage);

			const response = new SenderReceiverResponseDto();
			response.message = `User created`;

			return DataResponseFactory.success(StatusCodes.OK, response, response.message);
		} catch (ex) {
			const error = ex as Error;
			return DataResponseFactory.error(StatusCodes.BAD_REQUEST, error.message);
		}
	}
}
