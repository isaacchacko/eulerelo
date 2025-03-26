import { compare } from 'bcryptjs';

/**
 * Verifies if the provided password matches the hashed password
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns A promise that resolves to true if the password matches, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
} 