type AnalyticsEvent = {
  eventName: string
  data: Record<string, any>
}

type AnalyticsProvider = {
  name: string
  enabled: boolean
  trackEvent: (event: AnalyticsEvent) => Promise<void>
}

// Google Analytics Provider
const googleAnalyticsProvider: AnalyticsProvider = {
  name: 'google_analytics',
  enabled: true,
  trackEvent: async ({ eventName, data }) => {
    if (window.gtag) {
      window.gtag('event', eventName, data)
    }
  }
}

// Microsoft Clarity Provider
const microsoftClarityProvider: AnalyticsProvider = {
  name: 'microsoft_clarity',
  enabled: true,
  trackEvent: async ({ eventName, data }) => {
    if (window.clarity) {
      window.clarity('event', eventName, data)
    }
  }
}

// Segment Provider
const segmentProvider: AnalyticsProvider = {
  name: 'segment',
  enabled: true,
  trackEvent: async ({ eventName, data }) => {
    if (window.analytics) {
      window.analytics.track(eventName, data)
    }
  }
}

// Microsoft Dynamics 365 Provider
const dynamics365Provider: AnalyticsProvider = {
  name: 'dynamics_365',
  enabled: true,
  trackEvent: async ({ eventName, data }) => {
    if (window.Microsoft?.Dynamics365?.PostMessageRelay) {
      window.Microsoft.Dynamics365.PostMessageRelay.postMessage('trackEvent', {
        name: eventName,
        properties: data
      });
    }
  }
}

// Mixpanel Provider
const mixpanelProvider: AnalyticsProvider = {
  name: 'mixpanel',
  enabled: true,
  trackEvent: async ({ eventName, data }) => {
    if (window.mixpanel) {
      window.mixpanel.track(eventName, data)
    }
  }
}

// HubSpot Provider
const hubspotProvider: AnalyticsProvider = {
  name: 'hubspot',
  enabled: true,
  trackEvent: async ({ eventName, data }) => {
    if (window._hsq) {
      window._hsq.push(['trackEvent', {
        id: eventName,
        value: data
      }])
    }
  }
}

const providers: AnalyticsProvider[] = [
  googleAnalyticsProvider,
  microsoftClarityProvider,
  segmentProvider,
  dynamics365Provider,
  mixpanelProvider,
  hubspotProvider
]

export async function trackAnalyticsEvent(eventName: string, data: Record<string, any>) {
  await Promise.all(
    providers
      .filter(provider => provider.enabled)
      .map(provider => provider.trackEvent({ eventName, data }))
  )
}

interface Dynamics365Session {
  id: string;
  startTime: number;
  interactionCount: number;
}

let currentSession: Dynamics365Session | null = null;

// Dynamics 365 specific functions
export const dynamics365 = {
  initializeSession(): string {
    const sessionId = Math.random().toString(36).substring(2, 15);
    currentSession = {
      id: sessionId,
      startTime: Date.now(),
      interactionCount: 0
    };
    return sessionId;
  },

  clearSession(): void {
    currentSession = null;
  },

  getInteractionCount(): number {
    return currentSession?.interactionCount ?? 0;
  },

  resetInteractionCount(): void {
    if (currentSession) {
      currentSession.interactionCount = 0;
    }
  }
}
