import { ConfidentialClientApplication, Configuration, AuthenticationResult } from '@azure/msal-node';

interface AzureAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
}

class AzureAuthService {
  private msalConfig: Configuration;
  private msalClient: ConfidentialClientApplication;
  private scopes: string[];

  constructor() {
    this.scopes = JSON.parse(process.env.AZURE_AD_SCOPES || '[]');
    
    this.msalConfig = {
      auth: {
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        authority: `${process.env.AZURE_AD_AUTHORITY}${process.env.AZURE_AD_TENANT_ID}`,
      },
    };

    this.msalClient = new ConfidentialClientApplication(this.msalConfig);
  }

  async getAuthUrl(state?: string): Promise<string> {
    const authUrlRequest = {
      scopes: this.scopes,
      redirectUri: process.env.AZURE_AD_REDIRECT_URI!,
      state,
    };

    return await this.msalClient.getAuthCodeUrl(authUrlRequest);
  }

  async getTokenFromCode(code: string): Promise<AuthenticationResult> {
    const tokenRequest = {
      code,
      scopes: this.scopes,
      redirectUri: process.env.AZURE_AD_REDIRECT_URI!,
    };

    return await this.msalClient.acquireTokenByCode(tokenRequest);
  }

  async getTokenSilently(userId: string): Promise<AuthenticationResult | null> {
    try {
      const account = await this.msalClient.getTokenCache().getAccountByHomeId(userId);
      if (!account) return null;

      const silentRequest = {
        account,
        scopes: this.scopes,
      };

      return await this.msalClient.acquireTokenSilent(silentRequest);
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // Implement token validation logic here
      // You might want to use the jsonwebtoken package or similar
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const azureAuthService = new AzureAuthService();

// Export the class for testing purposes
export default AzureAuthService;
