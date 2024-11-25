import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { logger } from '../lib/logger';

const log = logger('graph-service');

interface GraphServiceConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  scopes: string[];
}

interface UserProfile {
  id: string;
  email: string | undefined;
  displayName: string | undefined;
  roles: string[] | undefined;
}

class GraphService {
  private client: Client;
  private credential: ClientSecretCredential;

  constructor() {
    this.credential = new ClientSecretCredential(
      process.env.AZURE_AD_TENANT_ID!,
      process.env.AZURE_AD_CLIENT_ID!,
      process.env.AZURE_AD_CLIENT_SECRET!
    );

    const authProvider = new TokenCredentialAuthenticationProvider(this.credential, {
      scopes: JSON.parse(process.env.GRAPH_API_SCOPES || '[]'),
    });

    this.client = Client.initWithMiddleware({
      authProvider,
      defaultVersion: process.env.GRAPH_API_VERSION,
    });
  }

  async getCurrentUser(accessToken: string) {
    try {
      const user = await this.client
        .api('/me')
        .select(['id', 'displayName', 'mail', 'userPrincipalName'])
        .get();

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.client
        .api(`/users/${userId}`)
        .select(['id', 'mail', 'displayName', 'jobTitle', 'department'])
        .get();

      return {
        id: response.id,
        email: response.mail,
        displayName: response.displayName,
        roles: [] // Implement role mapping logic here
      };
    } catch (error) {
      log.error('Failed to get user profile from Graph API', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return null;
    }
  }

  async getUserRoles(email: string): Promise<string[]> {
    try {
      const response = await this.client
        .api(`/users/${email}/memberOf`)
        .select(['displayName'])
        .get();

      // Extract role names from the response
      const roles = response.value
        .filter((group: any) => group['@odata.type']?.includes('#microsoft.graph.group'))
        .map((group: any) => group.displayName);

      return roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  async listUsers(filter?: string) {
    try {
      let request = this.client
        .api('/users')
        .select(['id', 'displayName', 'mail', 'userPrincipalName']);

      if (filter) {
        request = request.filter(filter);
      }

      const users = await request.get();
      return users;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }

  async getUserGroups(userId: string) {
    try {
      const groups = await this.client
        .api(`/users/${userId}/memberOf`)
        .select(['id', 'displayName', 'description'])
        .get();

      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  async getUserPhoto(userId: string) {
    try {
      const photo = await this.client
        .api(`/users/${userId}/photo/$value`)
        .get();

      return photo;
    } catch (error) {
      console.error('Error getting user photo:', error);
      throw error;
    }
  }

  async sendMail({
    toRecipients,
    subject,
    content,
    ccRecipients = [],
    bccRecipients = [],
  }: {
    toRecipients: string[];
    subject: string;
    content: string;
    ccRecipients?: string[];
    bccRecipients?: string[];
  }) {
    try {
      const mail = {
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content,
          },
          toRecipients: toRecipients.map(email => ({
            emailAddress: { address: email },
          })),
          ccRecipients: ccRecipients.map(email => ({
            emailAddress: { address: email },
          })),
          bccRecipients: bccRecipients.map(email => ({
            emailAddress: { address: email },
          })),
        },
      };

      await this.client.api('/me/sendMail').post(mail);
    } catch (error) {
      console.error('Error sending mail:', error);
      throw error;
    }
  }

  async createCalendarEvent({
    subject,
    start,
    end,
    attendees = [],
    location,
    description,
  }: {
    subject: string;
    start: Date;
    end: Date;
    attendees?: string[];
    location?: string;
    description?: string;
  }) {
    try {
      const event = {
        subject,
        start: {
          dateTime: start.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'UTC',
        },
        attendees: attendees.map(email => ({
          emailAddress: { address: email },
          type: 'required',
        })),
        ...(location && { location: { displayName: location } }),
        ...(description && { body: { contentType: 'HTML', content: description } }),
      };

      const response = await this.client.api('/me/events').post(event);
      return response;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const graphService = new GraphService();

// Export the class for testing purposes
export default GraphService;
