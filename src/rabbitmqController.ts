import client, { Connection, Message, Channel } from 'amqplib'

export default class RabbitmqController {
  rabbitmqClient = async () => {
    const connection = await client.connect("amqp://localhost:5672");
    return await connection.createChannel();
  }

  consumeCreateNoteRB = async () => {
    const channel = await this.rabbitmqClient()

    await channel.assertExchange('notes', 'direct', {durable: false});
    await channel.assertQueue('create-note', {durable: false});
        
    channel.bindQueue('create-note', 'notes', 'create-note-bq');

    return channel
  }

  publishReturningNotes = async (message: string) => {
    const channel = await this.rabbitmqClient()

    await channel.assertExchange('notes', 'direct', {durable: false});
    await channel.assertQueue('returning-note', {durable: false});
    channel.bindQueue('returning-note', 'notes', 'returning-note-bq');
    channel.publish('notes', 'returning-note-bq', Buffer.from(message));
    console.log('message sent');

    return channel
  }

  send = async (message: any) => {
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

  receive = async () => {
    const connection = await client.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertExchange('notes', 'direct', {durable: false});

    const createNote = await channel.assertQueue('create-note', {durable: false});
    const createNoteResult = await channel.assertQueue('create-note-result', {durable: false});

    channel.bindQueue('create-note', 'notes', '')
    console.log(createNote);
    console.log(createNoteResult);

    channel.consume('queue', (message: Message) => {
      console.log('message')
      if (message) {
        console.log(`Received: ${message.content.toString()}`);
        channel.ack(message)    
      }
    })
  };
}