import client, { Connection, Message, Channel } from 'amqplib'

// const queue = 'message'

export const send = async (queue: string, message: any) => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(message));
  console.log('message sent');

   setTimeout(() => {
    channel.close();
    connection.close();
  }, 1000);
}

let queue

export const receive = async () => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  const createNote = await channel.assertQueue('create-note', { durable: false });
  const createNoteResult = await channel.assertQueue('create-note-result', { durable: false });
  console.log(createNote);
  console.log(createNoteResult);

  

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