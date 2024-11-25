const { VisaDirectService } = require('../utils/visa-direct-service');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testVisaDirectConnection() {
  try {
    console.log('🔐 Testing Visa Direct connection with Two-Way SSL...');
    console.log('Environment:', {
      apiUrl: process.env.VISA_API_URL,
      keyId: process.env.VISA_KEY_ID ? '***' + process.env.VISA_KEY_ID.slice(-4) : 'Not set',
      certPath: process.env.VISA_CERT_PATH,
      keystorePath: process.env.VISA_KEYSTORE_PATH,
    });
    
    const visaService = VisaDirectService.getInstance();
    
    // Test push funds transfer with sandbox test cards
    console.log('\n📤 Initiating push funds transfer...');
    const response = await visaService.pushFundsTransfer({
      senderCardNumber: '4957030420210454', // Visa test card number
      recipientCardNumber: '4957030420210462', // Visa test card number
      amount: 100.00,
      currency: 'GBP',
      senderName: 'John Doe',
      recipientName: 'Jane Smith',
      purpose: 'Test Transfer'
    });

    console.log('✅ Push funds transfer successful!');
    console.log('Transaction Details:', {
      transactionId: response.transactionId,
      status: response.status,
      actionCode: response.actionCode,
      approvalCode: response.approvalCode,
      transmissionDateTime: response.transmissionDateTime
    });

    // Test transaction status
    if (response.transactionId) {
      console.log('\n🔍 Checking transaction status...');
      const statusResponse = await visaService.getTransactionStatus(response.transactionId);
      console.log('Transaction Status:', statusResponse.status);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.error) {
      console.error('Error details:', {
        code: error.error.code,
        message: error.error.message
      });
    }
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Starting Visa Direct integration test...\n');
testVisaDirectConnection().then(() => {
  console.log('\n✨ Test completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test failed with uncaught error:', error);
  process.exit(1);
});
