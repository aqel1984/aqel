export function getJwtSecretKey(): string {
    const secret = process.env['JWT_SECRET_KEY'];
    if (!secret) {
        throw new Error('JWT Secret key is not set in environment variables');
    }
    return secret;
}
