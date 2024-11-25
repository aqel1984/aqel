import { sendTestEmail } from '../lib/services/email';

async function main() {
  try {
    console.log('Sending test email to aqeljehad9@gmail.com...');
    const result = await sendTestEmail('aqeljehad9@gmail.com');
    console.log('Email sent successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('Failed to send email:', error);
    process.exit(1);
  }
}

main();
