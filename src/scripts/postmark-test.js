const postmark = require('postmark');

const serverToken = '994b32ab-fcb3-4b61-98f1-ec13d634b4d7';
const client = new postmark.ServerClient(serverToken);

async function testPostmark() {
  try {
    console.log('Testing Postmark connection...');
    
    const response = await client.sendEmail({
      From: 'manager@aqeljehadltd.net',
      To: 'manager@aqeljehadltd.net',
      Subject: 'Postmark Test',
      TextBody: 'Testing Postmark API',
      MessageStream: 'outbound'
    });

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email:', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response
    });
  }
}

testPostmark();
