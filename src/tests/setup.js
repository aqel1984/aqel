import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

// Load environment variables from .env file
config({ path: join(rootDir, '.env') });

// Validate required environment variables
const requiredEnvVars = [
    'VISA_R2P_KEY_ID',
    'VISA_R2P_API_URL',
    'VISA_R2P_PARTICIPANT_ID',
    'VISA_R2P_PARTICIPANT_NAME',
    'VISA_API_KEY',
    'VISA_CERT_PATH',
    'VISA_PRIVATE_KEY_PATH'
];

requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
});

console.log('Environment configured successfully for testing.');
