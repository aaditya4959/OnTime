import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_URL || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 16089
    }
});

client.on('error', err => console.log('Redis Client Error', err));

// Connect the client and handle initialization
let redisReady = false;

client.connect()
    .then(() => {
        redisReady = true;
        console.log('✅ Redis client connected successfully');
    })
    .catch(err => {
        console.error('❌ Failed to connect to Redis:', err);
        // Don't exit process, allow graceful degradation
    });

/**
 * Interface for storing OAuth tokens
 */
export interface OAuthTokens {
    googleId: string;
    telegramId: number;
    displayName: string;
    accessToken: string;
    refreshToken: string;
    createdAt: number;
}

/**
 * Check if Redis client is connected and ready
 */
export const isRedisReady = (): boolean => {
    return redisReady && client.isOpen;
};

/**
 * Store OAuth tokens in Redis
 * @param telegramId - The Telegram user ID
 * @param tokens - The OAuth token data
 */
export const storeOAuthTokens = async (telegramId: number, tokens: OAuthTokens): Promise<void> => {
    try {
        if (!isRedisReady()) {
            throw new Error('Redis client is not connected');
        }
        
        const key = `oauth:telegram:${telegramId}`;
        await client.setEx(
            key,
            30 * 24 * 60 * 60, // 30 days in seconds
            JSON.stringify(tokens)
        );
        console.log(`✅ OAuth tokens stored for Telegram user ${telegramId}`);
    } catch (error) {
        console.error(`❌ Error storing OAuth tokens for user ${telegramId}:`, error);
        throw error;
    }
};

/**
 * Retrieve OAuth tokens from Redis
 * @param telegramId - The Telegram user ID
 * @returns The stored OAuth tokens or null if not found
 */
export const getOAuthTokens = async (telegramId: number): Promise<OAuthTokens | null> => {
    try {
        if (!isRedisReady()) {
            console.warn('⚠️ Redis client is not connected, cannot retrieve tokens');
            return null;
        }
        
        const key = `oauth:telegram:${telegramId}`;
        const data = await client.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data) as OAuthTokens;
    } catch (error) {
        console.error(`❌ Error retrieving OAuth tokens for user ${telegramId}:`, error);
        return null;
    }
};

/**
 * Update refresh token in Redis
 * @param telegramId - The Telegram user ID
 * @param refreshToken - The new refresh token
 */
export const updateRefreshToken = async (telegramId: number, refreshToken: string): Promise<void> => {
    try {
        if (!isRedisReady()) {
            throw new Error('Redis client is not connected');
        }
        
        const key = `oauth:telegram:${telegramId}`;
        const data = await client.get(key);
        if (data) {
            const tokens = JSON.parse(data) as OAuthTokens;
            tokens.refreshToken = refreshToken;
            await client.setEx(
                key,
                30 * 24 * 60 * 60, // 30 days in seconds
                JSON.stringify(tokens)
            );
            console.log(`✅ Refresh token updated for Telegram user ${telegramId}`);
        }
    } catch (error) {
        console.error(`❌ Error updating refresh token for user ${telegramId}:`, error);
        throw error;
    }
};

/**
 * Delete OAuth tokens from Redis
 * @param telegramId - The Telegram user ID
 */
export const deleteOAuthTokens = async (telegramId: number): Promise<void> => {
    try {
        if (!isRedisReady()) {
            throw new Error('Redis client is not connected');
        }
        
        const key = `oauth:telegram:${telegramId}`;
        await client.del(key);
        console.log(`✅ OAuth tokens deleted for Telegram user ${telegramId}`);
    } catch (error) {
        console.error(`❌ Error deleting OAuth tokens for user ${telegramId}:`, error);
        throw error;
    }
};

