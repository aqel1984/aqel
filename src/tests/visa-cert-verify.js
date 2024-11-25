import https from 'https';
import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

async function verifyCertificate() {
    try {
        console.log('🔍 Verifying Visa API Certificate Configuration...\n');

        // 1. Check environment variables
        const requiredEnvVars = [
            'VISA_API_URL',
            'VISA_KEY_ID',
            'VISA_CERT_PATH',
            'VISA_PRIVATE_KEY_PATH'
        ];

        console.log('Checking environment variables:');
        requiredEnvVars.forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing required environment variable: ${varName}`);
            }
            console.log(`✓ ${varName} is set`);
        });

        // 2. Verify certificate files exist
        const certPath = process.env.VISA_CERT_PATH;
        const keyPath = process.env.VISA_PRIVATE_KEY_PATH;

        console.log('\nVerifying certificate files:');
        if (!fs.existsSync(certPath)) {
            throw new Error(`Certificate file not found: ${certPath}`);
        }
        console.log(`✓ Certificate file found at: ${certPath}`);

        if (!fs.existsSync(keyPath)) {
            throw new Error(`Private key file not found: ${keyPath}`);
        }
        console.log(`✓ Private key file found at: ${keyPath}`);

        // 3. Read and validate certificate
        console.log('\nValidating certificate:');
        const cert = await readFile(certPath);
        const key = await readFile(keyPath);

        // Create test HTTPS agent
        const httpsAgent = new https.Agent({
            cert: cert,
            key: key,
            passphrase: '13101984@Ogadi'
        });

        // 4. Test API Connection
        console.log('\n🌐 Testing API Connection...');
        const api = axios.create({
            baseURL: process.env.VISA_API_URL,
            httpsAgent: httpsAgent,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'keyId': process.env.VISA_KEY_ID
            }
        });

        // Generate request ID
        const requestId = crypto.randomBytes(16).toString('hex');

        // Test endpoint
        const response = await api.post('/request-to-pay/v1/reference-data', {
            requestMessageId: requestId,
            creationDateTime: new Date().toISOString()
        });

        console.log('\n✅ API Connection Successful!');
        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify(response.headers, null, 2));
        console.log('\nResponse Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\n❌ Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
            if (error.stack) {
                console.error('\nStack Trace:', error.stack);
            }
        }
        process.exit(1);
    }
}

// Run the verification
console.log('🚀 Starting Visa Certificate Verification...');
verifyCertificate();
