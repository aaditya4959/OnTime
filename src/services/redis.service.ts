import { createClient } from 'redis';

export const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_URL || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 16089
    }
});

client.on('error', err => console.log('Redis Client Error', err));



