import crypto from 'node:crypto';

/**
 * @typedef {Object} CampaignConfig
 * @property {string[]} channels - Distribution channels (e.g. 'email', 'sms', 'slack', 'webhook')
 * @property {Object} audience - Audience targeting criteria
 * @property {string[]} [audience.segments] - Audience segment IDs
 * @property {Object} [audience.filters] - Dynamic filter rules
 * @property {Object} schedule - Scheduling configuration
 * @property {string} schedule.startAt - ISO 8601 start time
 * @property {string} [schedule.endAt] - ISO 8601 end time
 * @property {string} [schedule.timezone] - IANA timezone
 * @property {Object} content - Channel-keyed content payloads
 */

/**
 * @typedef {'draft' | 'active' | 'paused' | 'completed' | 'cancelled'} CampaignStatus
 */

/**
 * Full-lifecycle campaign management: create, launch, pause, resume, and
 * collect performance metrics across multiple channels.
 */
export class CampaignManager {
  constructor() {
    /** @type {Map<string, Object>} */
    this._campaigns = new Map();
  }

  /**
   * Create a new campaign in draft status.
   *
   * @param {string} name - Human-readable campaign name
   * @param {CampaignConfig} config
   * @returns {{ campaignId: string, name: string, status: CampaignStatus, channels: string[], createdAt: string }}
   */
  createCampaign(name, config = {}) {
    if (!name) throw new Error('Campaign name is required');
    if (!config.channels || config.channels.length === 0) {
      throw new Error('At least one channel is required');
    }
    if (!config.audience) throw new Error('Audience configuration is required');
    if (!config.schedule?.startAt) throw new Error('schedule.startAt is required');
    if (!config.content) throw new Error('Content payload is required');

    const campaignId = crypto.randomUUID();
    const now = new Date().toISOString();

    const campaign = {
      campaignId,
      name,
      status: /** @type {CampaignStatus} */ ('draft'),
      channels: [...config.channels],
      audience: { ...config.audience },
      schedule: { ...config.schedule },
      content: { ...config.content },
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        delivered: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      history: [{ action: 'created', at: now }],
      createdAt: now,
      launchedAt: null,
      completedAt: null,
    };

    this._campaigns.set(campaignId, campaign);

    return {
      campaignId,
      name,
      status: campaign.status,
      channels: campaign.channels,
      createdAt: now,
    };
  }

  /**
   * Launch a draft campaign. Transitions status to `active`.
   *
   * @param {string} campaignId
   * @returns {{ campaignId: string, status: CampaignStatus, launchedAt: string }}
   */
  launchCampaign(campaignId) {
    const campaign = this._campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign "${campaignId}" not found`);
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      throw new Error(`Cannot launch campaign in "${campaign.status}" status`);
    }

    const now = new Date().toISOString();
    campaign.status = 'active';
    campaign.launchedAt = campaign.launchedAt ?? now;
    campaign.history.push({ action: 'launched', at: now });

    // Simulate initial delivery metrics
    const audienceSize = campaign.audience.segments?.length
      ? campaign.audience.segments.length * 500
      : 1000;
    campaign.metrics.delivered += audienceSize;
    campaign.metrics.impressions += Math.round(audienceSize * 0.85);

    return { campaignId, status: 'active', launchedAt: campaign.launchedAt };
  }

  /**
   * Pause an active campaign.
   *
   * @param {string} campaignId
   * @returns {{ campaignId: string, status: CampaignStatus, pausedAt: string }}
   */
  pauseCampaign(campaignId) {
    const campaign = this._campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign "${campaignId}" not found`);
    if (campaign.status !== 'active') {
      throw new Error(`Cannot pause campaign in "${campaign.status}" status`);
    }

    const now = new Date().toISOString();
    campaign.status = 'paused';
    campaign.history.push({ action: 'paused', at: now });

    return { campaignId, status: 'paused', pausedAt: now };
  }

  /**
   * Resume a paused campaign.
   *
   * @param {string} campaignId
   * @returns {{ campaignId: string, status: CampaignStatus, resumedAt: string }}
   */
  resumeCampaign(campaignId) {
    const campaign = this._campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign "${campaignId}" not found`);
    if (campaign.status !== 'paused') {
      throw new Error(`Cannot resume campaign in "${campaign.status}" status`);
    }

    const now = new Date().toISOString();
    campaign.status = 'active';
    campaign.history.push({ action: 'resumed', at: now });

    // Simulate additional delivery on resume
    campaign.metrics.delivered += 200;
    campaign.metrics.impressions += 170;

    return { campaignId, status: 'active', resumedAt: now };
  }

  /**
   * Return performance metrics for a campaign.
   *
   * @param {string} campaignId
   * @returns {{ campaignId: string, status: CampaignStatus, metrics: Object, channels: string[] }}
   */
  getCampaignMetrics(campaignId) {
    const campaign = this._campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign "${campaignId}" not found`);

    // Simulate engagement metrics accumulation for active campaigns
    if (campaign.status === 'active') {
      campaign.metrics.clicks += Math.round(campaign.metrics.impressions * 0.04);
      campaign.metrics.conversions += Math.round(campaign.metrics.clicks * 0.12);
    }

    return {
      campaignId,
      status: campaign.status,
      metrics: { ...campaign.metrics },
      channels: campaign.channels,
    };
  }
}

export default CampaignManager;
