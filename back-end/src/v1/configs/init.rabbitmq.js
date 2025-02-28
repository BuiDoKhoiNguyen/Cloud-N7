import amqplib from 'amqplib'

class RabbitMQ {
  channel

  async connect() {
    try {
      const connection = await amqplib.connect(process.env.RABBITMQ_URL)
      this.channel = await connection.createChannel()

      connection.on('close', () => {
        console.error('RabbitMQ connection closed, reconnecting...');
        setTimeout(() => this.connect(), 1000)
      })

      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        setTimeout(() => this.connect(), 1000)
      })

      console.log('RabbitMQ connected');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
    }
  }
}


export default new RabbitMQ();