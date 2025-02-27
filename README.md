<h1>cached-notes</h1> <br>

This project was made with the purpose of learning new technologies such as: 

 - create a NoSQL database with MongoDb;
 - run processes in isolated containers with Docker;
 - implement cache and authentication with Redis;
 - make a queue system with RabbitMQ, to simulate the information exchange between services;

Other stacks used:

 - NodeJS;
 - Typescript;
 - Express;

Here’s the workflow’s diagram to follow along:

<img src="https://github.com/user-attachments/assets/b075ff9a-0ebd-4c93-a767-4ef939f8b374"> <br />

First, we need to start RabbitMQ and Redis as Docker containers.

<img src="https://github.com/user-attachments/assets/3fff94dd-efab-47d5-ac30-127283964421"> <br />

<h2><strong>Post Method:</strong></h2>

When starting the application, RabbitMQ is gonna run.

<img src="https://github.com/user-attachments/assets/89fd35bf-c98f-4aa4-a3e0-2d2f30f30680" width="530px"> <br />

Automatically, the exchange “notes” will be created in RabbitMQ along with the queue “create-note” binded to it.

<img src="https://github.com/user-attachments/assets/f5f378b6-e10f-44c9-bf19-bfa320a7bad9" width="530px"> <br />

<img src="https://github.com/user-attachments/assets/ce4a5a10-9034-4c81-8c75-3bc5bace46a3" width="650px"> <br />

The next step is the note creation. In the <strong>Publish message</strong> section of the queue, we're gonna write the note in json format. 
The “create-note” queue is gonna act as a producer in this case, since we’re gonna send a message to a consumer.

<img src="https://github.com/user-attachments/assets/77edb1cd-6876-42ba-9f04-9aae65405ab6" width="530px"> <br />

After clicking on <strong>Publish message</strong>, the message is gonna be ready to be sent, and received by a consumer.

<img src="https://github.com/user-attachments/assets/9d37ff34-15e6-4a68-a401-47fd709f7343" width="650px"> <br />
(When you run the app, and send the message, you not gonna see the “1” bellow “ready”, because the process happens to fast, i’ve put it here just to illustrate)

In the server, the consumer is listening to the queue “create-note”, so as soon as it receives the message, since it comes as a string, we need to parse it to an object, so we can handle this data properly.

![Captura de tela 2025-02-26 214613](https://github.com/user-attachments/assets/49673c5e-0c93-4148-9f07-c4c196de4941)

When this process is completed, a verification is done to see if there is a token with the note. If it has, it’ll compare the notes token with the Redis token (that is manually created), and see if they match.

<img src="https://github.com/user-attachments/assets/b437e0a8-202b-4281-9ce6-1ae324b8fa43" width="530px"> <br />

If tokens don’t match, it’ll throw an error:

![Captura de tela 2025-02-26 223217](https://github.com/user-attachments/assets/3ad8b875-3da3-4121-b600-4aa5dc10b309)

But if everything is ok, the note is created in MongoDB.

<img src="https://github.com/user-attachments/assets/a10f299b-6645-47e1-8792-ec21dccfacdd" width="530px"> <br />

Then, the server will create a “returning-note” queue, parse the note object to string, and publish the note to “returning-note” so we can return the result back to RabbitMQ.

<img src="https://github.com/user-attachments/assets/13a10cfc-356d-4db6-a5e1-7ab950f643c0" width="680px"> <br />

When you go to the “get message” section of “returning-note” queue, and click on <strong>Get Message(s)</strong>, you’ll see the returned note.

<img src="https://github.com/user-attachments/assets/0dc72dc7-6ab0-4a6c-91e3-d68d2769ba55" width="640px"> <br />

<h2><strong>Get method:</strong></h2>

Here, we’re gonna query only one message by ID.

For that, I'm gonna use Postman to make the http request.

<img src="https://github.com/user-attachments/assets/81464772-4563-44d7-9f08-08a9a66c1ae7" width="530px"> <br />

After the request, the app verifies again if the user is authenticated, matching this time the header value, with Redis token, and if it passes, the note will be queried from MongoDB and stored in Redis.

![Captura de tela 2025-02-26 222608](https://github.com/user-attachments/assets/c295cb81-23bf-418e-b676-bb144b66446d)

Note returned: <br />
<img src="https://github.com/user-attachments/assets/f6a17167-71fc-4e7c-8a1a-6e2ec03d81b7" width="530px"> <br />

Note stored in Redis: <br />
<img src="https://github.com/user-attachments/assets/a93b76fe-fb39-4e2d-a69c-0e776dbd50b0" width="530px"> <br />

Then in a second query, we’re not gonna query the database, but the cache in Redis, making the application more efficient.

![Captura de tela 2025-02-26 224208](https://github.com/user-attachments/assets/601136b6-e0d4-4bd9-ba4b-d42207f2ff5d)



