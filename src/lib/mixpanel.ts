import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = '2466c94ad9c8bd2eac1c1aeb0b825744';

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
