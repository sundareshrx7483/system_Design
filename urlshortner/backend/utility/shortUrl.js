import { customAlphabet } from 'nanoid';

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const generateShortUrl = () => {
  return customAlphabet(BASE62_ALPHABET, 7)();
};