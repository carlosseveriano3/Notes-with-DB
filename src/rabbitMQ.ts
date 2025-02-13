import client, { Connection } from 'amqplib'

const queue = 'message'

export const enqueue = async (message: any) => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(message));
  console.log('message sent');

  setTimeout(() => {
    channel.close();
    connection.close();
    dequeue()
  }, 1000);
};

const dequeue = async () => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  console.log("Waiting for messages in queue...");

  channel.consume(queue, (message) => {
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