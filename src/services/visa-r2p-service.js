import axios from 'axios';
import { VisaDirectService } from '../utils/visa-direct-service.js';

class VisaR2PService {
    constructor() {
        this.visaDirectService = new VisaDirectService();
        this.baseURL = process.env.VISA_R2P_API_URL;
        this.keyId = process.env.VISA_R2P_KEY_ID;
        this.participantId = process.env.VISA_R2P_PARTICIPANT_ID;
    }

    /**
     * Get reference data for R2P participants
     * @returns {Promise<Object>} List of active R2P participants and their details
     */
    async getReferenceData() {
        try {
            const requestBody = {
                creationDateTime: new Date().toISOString(),
                referenceDataTypes: ["availableParticipants"],
                requestMessageId: this.generateRequestMessageId()
            };

            const headers = await this.visaDirectService.generateHeaders();

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/reference-data`,
                headers: {
                    ...headers,
                    'keyId': this.keyId,
                    'Content-Type': 'application/json'
                },
                data: requestBody
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Create a new Request to Pay
     * @param {Object} params Payment request parameters
     * @returns {Promise<Object>} Created R2P details
     */
    async createRequestToPay({
        amount,
        currency,
        debtorName,
        debtorMobileNumber,
        expiryDateTime = null
    }) {
        try {
            const requestBody = {
                creationDateTime: new Date().toISOString(),
                requestMessageId: this.generateRequestMessageId(),
                creditor: {
                    id: this.participantId,
                    name: process.env.VISA_R2P_PARTICIPANT_NAME
                },
                debtor: {
                    name: debtorName,
                    mobileNumber: debtorMobileNumber
                },
                payment: {
                    amount,
                    currency,
                    type: "PAYMENT",
                    scheme: "VISA_R2P"
                },
                expiryDateTime: expiryDateTime || this.getDefaultExpiryTime()
            };

            const headers = await this.visaDirectService.generateHeaders();

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/request-to-pay`,
                headers: {
                    ...headers,
                    'keyId': this.keyId,
                    'Content-Type': 'application/json'
                },
                data: requestBody
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get status of a Request to Pay
     * @param {string} r2pId The R2P ID to check
     * @returns {Promise<Object>} R2P status details
     */
    async getRequestToPayStatus(r2pId) {
        try {
            const requestBody = {
                creationDateTime: new Date().toISOString(),
                requestMessageId: this.generateRequestMessageId()
            };

            const headers = await this.visaDirectService.generateHeaders();

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/request-to-pay/${r2pId}/status`,
                headers: {
                    ...headers,
                    'keyId': this.keyId,
                    'Content-Type': 'application/json'
                },
                data: requestBody
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Generate a unique request message ID
     * @returns {string} Unique message ID
     */
    generateRequestMessageId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `R2P-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Get default expiry time (24 hours from now)
     * @returns {string} ISO datetime string
     */
    getDefaultExpiryTime() {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        return expiry.toISOString();
    }

    /**
     * Handle API errors
     * @param {Error} error - The error object
     * @returns {Error} Enhanced error with additional context
     */
    handleError(error) {
        if (error.response) {
            const { code, message, details } = error.response.data;
            
            // Log error details for debugging
            console.error('Visa R2P API Error:', {
                code,
                message,
                details,
                status: error.response.status
            });

            // Handle specific error codes
            switch (code) {
                case 'RC1000':
                    return new Error('Invalid request: Data missing or invalid');
                case 'RC2000':
                    return new Error('Business validation failure');
                case 'RC3001':
                    return new Error('Authorization failure: Request blocked');
                case 'RC3002':
                    return new Error('Authorization failure: Velocity/frequency control');
                case 'RC4000':
                    return new Error('Unknown entity in request');
                case 'RC5000':
                    return new Error('Server error: Please try again later');
                default:
                    return new Error(`Visa R2P API Error: ${message}`);
            }
        }

        // Handle network or other errors
        return new Error('Failed to communicate with Visa R2P API');
    }
}

// Export as singleton
export const visaR2PService = new VisaR2PService();
