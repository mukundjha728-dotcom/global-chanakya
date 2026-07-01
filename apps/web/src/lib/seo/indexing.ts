import { JWT } from 'google-auth-library';

export type IndexingAction = 'URL_UPDATED' | 'URL_DELETED';

export async function notifyGoogleIndexingAPI(url: string, type: IndexingAction = 'URL_UPDATED') {
  // We generally only want to ping Google in production to preserve quota
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Skipped Google Indexing API for ${url} (${type})`);
    return false;
  }

  try {
    const credentialsStr = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsStr) {
      console.warn("Google Indexing API credentials not found. Skipping.");
      return false;
    }

    const credentials = JSON.parse(credentialsStr);
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key?.replace(/\\n/g, '\n'), // Handle escaped newlines
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
    
    const response = await client.request({
      url: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        url: url,
        type: type,
      },
    });

    if (response.status === 200) {
      console.log(`Successfully notified Google Indexing API: ${url} (${type})`);
      return true;
    } else {
      console.error(`Failed to notify Google Indexing API: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('Error notifying Google Indexing API:', error);
    return false;
  }
}
