import client, { Connection, Message, Channel } from 'amqplib'

// const queue = 'message'

export const rabbitmqClient = async () => {
  const connection = await client.connect("amqp://localhost:5672");
  return await connection.createChannel();
}

export const send = async (message: any) => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertExchange('notes', 'direct', {durable: false});
  channel.publish('notes', '', Buffer.from(message));
  console.log('message sent');

   setTimeout(() => {
    channel.close();
    connection.close();
  }, 1000);
}

export const receive = async () => {
  const connection = await client.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertExchange('notes', 'direct', {durable: false});

  const createNote = await channel.assertQueue('create-note', {durable: false});
  const createNoteResult = await channel.assertQueue('create-note-result', {durable: false});

  channel.bindQueue('create-note', 'notes', '')
  console.log(createNote);
  console.log(createNoteResult);

  let queue: string = 'create-note'

  if (createNote.messageCount >= 1) {
    console.log('inside "create-note" queue');

    queue = createNote.queue
  } 
  
  if (createNoteResult.messageCount >= 1) {
    console.log('inside "create-note-result" queue');

    queue = createNoteResult.queue
  }

  channel.consume(queue, (message: Message) => {
    console.log('message')
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