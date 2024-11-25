import https from 'https';
import fs from 'fs';
import axios from 'axios';

async function testVisaCertificate() {
    try {
        console.log('Testing Visa API Certificate Configuration...\n');

        // 1. Verify certificate files
        const certPath = process.env.VISA_CERT_PATH;
        const keyPath = process.env.VISA_PRIVATE_KEY_PATH;

        console.log('Certificate Paths:');
        console.log('- Certificate:', certPath);
        console.log('- Private Key:', keyPath);

        if (!fs.existsSync(certPath)) {
            throw new Error(`Certificate file not found: ${certPath}`);
        }
        if (!fs.existsSync(keyPath)) {
            throw new Error(`Private key file not found: ${keyPath}`);
        }

        // 2. Read certificate info
        const cert = fs.readFileSync(certPath);
        const key = fs.readFileSync(keyPath);

        // 3. Create HTTPS agent with certificates
        const httpsAgent = new https.Agent({
            cert: cert,
            key: key,
            passphrase: '13101984@Ogadi'
        });

        // 4. Create axios instance
        const api = axios.create({
            baseURL: process.env.VISA_API_URL,
            httpsAgent: httpsAgent,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'keyId': process.env.VISA_KEY_ID
            }
        });

        // 5. Test API connection
        console.log('\nTesting API Connection...');
        const response = await api.get('/request-to-pay/v1/reference-data');

        console.log('\nAPI Connection Successful!');
        console.log('Response Status:', response.status);
        console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\nError Testing Certificate:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
            if (error.stack) {
                console.error('Stack:', error.stack);
            }
        }
        process.exit(1);
    }
}

// Run the test
console.log('Starting Visa Certificate Test...');
testVisaCertificate();
