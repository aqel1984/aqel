import './setup.js';
import { visaR2PService } from '../services/visa-r2p-service.js';
import fs from 'fs';

async function testR2PService() {
    try {
        // First verify certificate files exist
        console.log('\nVerifying certificate files...');
        const certPath = process.env.VISA_CERT_PATH;
        const keyPath = process.env.VISA_PRIVATE_KEY_PATH;
        
        if (!fs.existsSync(certPath)) {
            throw new Error(`Certificate file not found at: ${certPath}`);
        }
        console.log('✓ Certificate file found');
        
        if (!fs.existsSync(keyPath)) {
            throw new Error(`Private key file not found at: ${keyPath}`);
        }
        console.log('✓ Private key file found');

        // Test 1: Reference Data API
        console.log('\n1. Testing Visa R2P Reference Data API...');
        console.log('Endpoint:', `${process.env.VISA_R2P_API_URL}/reference-data`);
        console.log('Participant ID:', process.env.VISA_R2P_PARTICIPANT_ID);
        
        const referenceData = await visaR2PService.getReferenceData();
        console.log('\nReference Data Response:', JSON.stringify(referenceData, null, 2));

        // Test 2: Create R2P Request
        console.log('\n2. Testing Create Request to Pay...');
        const r2pRequest = await visaR2PService.createRequestToPay({
            amount: 10.00,
            currency: 'GBP',
            debtorName: 'John Test',
            debtorMobileNumber: '+447123456789'
        });
        console.log('\nR2P Creation Response:', JSON.stringify(r2pRequest, null, 2));

        // Test 3: Get R2P Status
        if (r2pRequest.r2pId) {
            console.log('\n3. Testing Get Request to Pay Status...');
            const status = await visaR2PService.getRequestToPayStatus(r2pRequest.r2pId);
            console.log('\nR2P Status Response:', JSON.stringify(status, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Error testing R2P service:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test
console.log('Starting Visa R2P Service Tests...');
testR2PService();
