# Kafka Demo in Express.js (TypeScript) and Event Driven approach.

## Overview
This repository demonstrates an event-driven architecture using Kafka in a Node.js (Express.js with TypeScript) environment. The goal is to showcase two messaging patterns to facilitate asynchronous communication between services.

## Messaging Patterns Implemented
This demo explores two essential Kafka patterns:

#### Sender and Receiver (Point-to-Point Communication)
- A producer sends messages to a specific Kafka topic.
- A single consumer, part of a consumer group, consumes messages from the topic.
- Ensures that only one consumer within the group processes each message.
- Ideal for scenarios requiring direct message delivery to a single recipient.

#### Publisher and Subscriber (Pub/Sub Pattern)
- Producers publish messages to a Kafka topic, which acts as the central hub.
- Multiple consumers subscribe to the topic and process messages independently.
- Enables loosely coupled event-driven architectures where multiple services can react to the same event.
- Consumers maintain their own offsets, allowing independent message processing.

## Roles in the System
Kafka handles two primary roles in messaging:
#### Producer
- Responsible for publishing messages to Kafka topics.
- Implements logic to structure data before transmission.
- Examples: API service triggering an event, event publisher.

#### Consumer
- Subscribes to Kafka topics and processes incoming messages asynchronously.
- Can commit message offsets to track consumption progress.
- Examples: Background worker processing tasks, microservice reacting to events.

#### Setup Kafka Using Docker
- Run the following commands to start a Kafka container:
```bash
docker pull confluentinc/confluent-local:7.4.1
docker run -d --name kafka -p 9092:9092 -p 9093:9093 -e KAFKA_NODE_ID=1 -e KAFKA_PROCESS_ROLES="broker,controller" -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP="PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT" -e KAFKA_LISTENERS="PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093" -e KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092" -e KAFKA_CONTROLLER_QUORUM_VOTERS="1@localhost:9093" confluentinc/confluent-local:7.4.1

```

#### Project Setup
- Clone the Repository
```bash
git clone <your-repo-url>
cd <your-project-directory>
``` 
- Setup `util` Service
    - Move into the util solution and create an .env file:
    ```bash
    NODE_ENV=development
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Build the utility package:
    ```bash
    npm run build
    ```
    - Link the package:
    ```bash
    npm link
    ```
- Setup `api` Service
    - Move into the api solution and create an .env file:
    ```bash
    NODE_ENV=development
    PORT=3000

    # Logging
    LOG_FORMAT=dev
    LOG_DIR=logs

    # CORS Config
    ORIGIN=*
    CREDENTIALS=true

    # KAFKA
    KAFKA_BROKER=localhost:9092

    # Rate Limiter
    RATE_LIMITER=1000
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Link the `util` package:
    ```bash
    npm link <utilurl>
    ```
    - Build the Api service:
    ```bash
    npm run build
    ```
    - Run the API in development mode:
    ```bash
    npm run dev
    ```