const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");

class VisaDirectService {
  static instance;
  client;
  credentials;

  constructor() {
    this.validateEnvironment();

    this.credentials = {
      apiKey: process.env.VISA_API_KEY,
      keyId: process.env.VISA_KEY_ID,
      keystore: fs.readFileSync(process.env.VISA_KEYSTORE_PATH),
      keystorePassword: process.env.VISA_KEYSTORE_PASSWORD,
      rootCertPath: process.env.VISA_ROOT_CERT_PATH,
      intermediateCertPath: process.env.VISA_INTERMEDIATE_CERT_PATH,
      cert: fs.readFileSync(process.env.VISA_CERT_PATH),
      key: fs.readFileSync(process.env.VISA_PRIVATE_KEY_PATH),
    };

    const rootCert = fs.readFileSync(this.credentials.rootCertPath);
    const intermediateCert = fs.readFileSync(this.credentials.intermediateCertPath);

    this.client = axios.create({
      baseURL: process.env.VISA_API_URL,
      httpsAgent: new https.Agent({
        cert: this.credentials.cert,
        key: this.credentials.key,
        ca: [rootCert, intermediateCert],
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    // Add request interceptor for authentication and tracking
    this.client.interceptors.request.use((config) => {
      const requestId = crypto.randomBytes(16).toString('hex');
      const timestamp = new Date().toISOString();
      
      // Generate authentication signature
      const signature = this.generateSignature(config.method, config.url, timestamp, config.data);
      
      // Add authentication and tracking headers
      config.headers = {
        ...config.headers,
        'x-request-id': requestId,
        'x-client-transaction-id': requestId,
        'x-correlation-id': requestId,
        'x-api-key': this.credentials.apiKey,
        'x-key-id': this.credentials.keyId,
        'x-timestamp': timestamp,
        'x-signature': signature,
        'x-request-timestamp': timestamp,
        'x-auth-client-id': this.credentials.keyId,
        'x-auth-organization-id': process.env.VISA_ACQUIRER_ID,
      };

      // Log request details in development
      if (process.env.NODE_ENV !== 'production') {
        this.logRequestDetails(config);
      }

      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (process.env.NODE_ENV !== 'production') {
          this.logErrorDetails(error);
        }
        return Promise.reject(error);
      }
    );
  }

  validateEnvironment() {
    const requiredEnvVars = [
      'VISA_API_URL',
      'VISA_API_KEY',
      'VISA_KEY_ID',
      'VISA_CERT_PATH',
      'VISA_PRIVATE_KEY_PATH',
      'VISA_KEYSTORE_PATH',
      'VISA_KEYSTORE_PASSWORD',
      'VISA_ROOT_CERT_PATH',
      'VISA_INTERMEDIATE_CERT_PATH',
      'VISA_ACQUIRER_ID',
      'VISA_DEFAULT_CURRENCY',
      'VISA_TRANSACTION_PURPOSE'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  logRequestDetails(config) {
    console.log('Request Details:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method.toUpperCase(),
      headers: {
        ...config.headers,
        'x-api-key': '***' + config.headers['x-api-key'].slice(-4),
        'x-key-id': '***' + config.headers['x-key-id'].slice(-4),
        'x-auth-client-id': '***' + config.headers['x-auth-client-id'].slice(-4),
      },
      payload: config.data,
    });
  }

  logErrorDetails(error) {
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          'x-api-key': '***',
          'x-key-id': '***',
          'x-auth-client-id': '***',
        },
      },
    });
  }

  generateSignature(method, path, timestamp, body) {
    const payload = [
      method.toUpperCase(),
      path,
      timestamp,
      this.credentials.keyId,
      process.env.VISA_ACQUIRER_ID,
      body ? JSON.stringify(body) : ''
    ].join('');

    return crypto
      .createHmac('sha256', this.credentials.apiKey)
      .update(payload)
      .digest('hex');
  }

  static getInstance() {
    if (!VisaDirectService.instance) {
      VisaDirectService.instance = new VisaDirectService();
    }
    return VisaDirectService.instance;
  }

  async pushFundsTransfer(request) {
    try {
      const payload = {
        systemsTraceAuditNumber: this.generateTraceNumber(),
        retrievalReferenceNumber: this.generateRRN(),
        localTransactionDateTime: new Date().toISOString(),
        acquiringBin: process.env.VISA_ACQUIRER_ID,
        acquirerCountryCode: '826', // UK
        senderAccountNumber: request.senderCardNumber,
        senderName: request.senderName,
        senderCountryCode: '826',
        transactionCurrency: request.currency || process.env.VISA_DEFAULT_CURRENCY,
        transactionAmount: request.amount.toString(),
        recipientCardNumber: request.recipientCardNumber,
        recipientName: request.recipientName,
        businessApplicationId: 'PP', // Push Payment
        transactionPurpose: request.purpose || process.env.VISA_TRANSACTION_PURPOSE,
      };

      const response = await this.client.post(
        '/visadirect/fundstransfer/v1/pushfundstransactions',
        payload
      );

      return {
        transactionId: response.data.transactionIdentifier,
        status: response.data.actionCode === '00' ? 'SUCCESS' : 'FAILED',
        actionCode: response.data.actionCode,
        approvalCode: response.data.approvalCode,
        transmissionDateTime: response.data.transmissionDateTime,
      };
    } catch (error) {
      console.error('Visa Direct push funds transfer error:', error.response?.data || error.message);
      throw {
        status: 'FAILED',
        error: {
          code: error.response?.data?.errorCode || 'UNKNOWN_ERROR',
          message: error.response?.data?.message || error.message,
          details: error.response?.data || undefined,
        },
      };
    }
  }

  generateTraceNumber() {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  generateRRN() {
    const date = new Date();
    const yymmdd = date
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `${yymmdd}${random}`;
  }

  async getTransactionStatus(transactionId) {
    try {
      const response = await this.client.get(
        `/visadirect/fundstransfer/v1/pushfundstransactions/${transactionId}`
      );

      return {
        transactionId: response.data.transactionIdentifier,
        status: response.data.actionCode === '00' ? 'SUCCESS' : 'FAILED',
        actionCode: response.data.actionCode,
        approvalCode: response.data.approvalCode,
        transmissionDateTime: response.data.transmissionDateTime,
      };
    } catch (error) {
      console.error('Visa Direct transaction status error:', error.response?.data || error.message);
      throw {
        status: 'FAILED',
        error: {
          code: error.response?.data?.errorCode || 'UNKNOWN_ERROR',
          message: error.response?.data?.message || error.message,
          details: error.response?.data || undefined,
        },
      };
    }
  }
}

module.exports = { VisaDirectService };
