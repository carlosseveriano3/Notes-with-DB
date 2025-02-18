import client, { Connection, Message } from 'amqplib'

// const queue = 'message'

export const enqueue = async (queue: string, message: string) => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(message));
  console.log('message sent');

  setTimeout(() => {
    channel.close();
    connection.close();
  }, 1000);
};

export const dequeue = async (queue: string) => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  console.log("Waiting for messages in queue...");

  channel.consume(queue, (message: Message) => {
    if (message) {
      console.log(`Received: ${message.content.toString()}`);
      channel.ack(message)    
    }
  })

  setTimeout(() => {
    channel.close();
    connection.close();
  }, 1000);
};


// amqp.connect("amqp://localhost:5672", (error: Error, connection: Connection) => {
//   if (error) {
//     throw error;
//   }
  
// })