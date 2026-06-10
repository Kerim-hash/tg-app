import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

let isMixpanelInitialized = false;

export const initMixpanel = () => {
  if (typeof window !== 'undefined' && !isMixpanelInitialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      autocapture: true,
      record_sessions_percent: 100,
    });
    isMixpanelInitialized = true;
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    if (!isMixpanelInitialized) {
      initMixpanel();
    }
    mixpanel.track(eventName, properties);
  }
};

export default mixpanel;
