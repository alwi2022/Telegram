import { StreamChat } from 'stream-chat';

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;

if (!apiKey) {
  throw new Error('Missing Stream API key. Set EXPO_PUBLIC_STREAM_API_KEY in .env file.');
}
export const streamClient = StreamChat.getInstance(apiKey);

