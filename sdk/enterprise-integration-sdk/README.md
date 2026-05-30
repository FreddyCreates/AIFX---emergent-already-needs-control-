# @medina/enterprise-integration-sdk — v1.0.0

> Plug any enterprise into a sovereign intelligence substrate.

**License:** Proprietary (commercial license — UNLICENSED)
**Monetization:** Per-seat or per-connector pricing

---

## Installation

```bash
npm install @medina/enterprise-integration-sdk
```

## Quick Start

```js
import {
  CompanyOnboarding,
  SalesforceConnector,
  CampaignManager,
  MultiChannelMessenger,
  ExportPipeline,
} from '@medina/enterprise-integration-sdk';
```

---

## Exports

### CompanyOnboarding

Three onboarding modes for enterprise customers:

| Mode | Fields | Steps |
|------|--------|-------|
| `express` | Minimal (name, email) | basic_info → api_credentials → confirmation |
| `standard` | Full profile | basic_info → company_profile → team_setup → api_credentials → billing → confirmation |
| `sovereign` | Full + doctrine alignment | …standard steps + doctrine_alignment → sovereignty_audit → confirmation |

```js
const onboarding = new CompanyOnboarding();

const session = onboarding.beginOnboarding(
  { companyName: 'Acme Corp', adminEmail: 'admin@acme.com' },
  'express',
);

onboarding.completeStep(session.sessionId, 'basic_info', { verified: true });
onboarding.completeStep(session.sessionId, 'api_credentials', { keyId: 'ak_123' });
onboarding.completeStep(session.sessionId, 'confirmation', { accepted: true });

const result = onboarding.finalize(session.sessionId);
// → { companyId, companyName, mode, status, record, completedAt }

const status = onboarding.getStatus(session.sessionId);
// → { progress: { total, completed, remaining, percentComplete } }
```

### Connectors

Eight pre-built connector templates extending `BaseConnector`:

| Connector | Service | Entities |
|-----------|---------|----------|
| `SalesforceConnector` | Salesforce CRM | accounts, contacts, opportunities |
| `SAPConnector` | SAP ERP | materials, purchase_orders, business_partners |
| `GoogleConnector` | Google Workspace | drive, calendar, contacts |
| `SlackConnector` | Slack | channels, messages, users |
| `HubSpotConnector` | HubSpot CRM | contacts, deals, tickets |
| `StripeConnector` | Stripe Payments | customers, subscriptions, invoices |
| `TwilioConnector` | Twilio Comms | messages, calls, phone_numbers |
| `ShopifyConnector` | Shopify Commerce | products, orders, customers |

#### BaseConnector API

| Method | Description |
|--------|-------------|
| `connect()` | Establish connection to the service |
| `disconnect()` | Tear down the connection |
| `healthCheck()` | Ping the service and return latency |
| `sync(direction, entity, options?)` | Sync data — `'inbound'`, `'outbound'`, or `'bidirectional'` |
| `mapFields(sourceSchema, targetSchema)` | Auto-map matching fields between schemas |

```js
const sf = new SalesforceConnector({
  apiKey: 'sf_token_xxx',
  instanceUrl: 'https://myorg.salesforce.com',
});

await sf.connect();
await sf.sync('inbound', 'contacts', { limit: 50 });
sf.mapFields(
  { Name: 'string', Email: 'string', Phone: 'string' },
  { name: 'string', email: 'string', phone: 'string' },
);
await sf.disconnect();
```

### CampaignManager

Full-lifecycle campaign management across channels.

| Method | Description |
|--------|-------------|
| `createCampaign(name, config)` | Create a draft campaign with channels, audience, schedule, content |
| `launchCampaign(campaignId)` | Activate the campaign |
| `pauseCampaign(campaignId)` | Pause an active campaign |
| `resumeCampaign(campaignId)` | Resume a paused campaign |
| `getCampaignMetrics(campaignId)` | Get impressions, clicks, conversions, delivery stats |

```js
const campaigns = new CampaignManager();

const { campaignId } = campaigns.createCampaign('Summer Sale', {
  channels: ['email', 'sms'],
  audience: { segments: ['vip', 'recent'] },
  schedule: { startAt: '2025-07-01T00:00:00Z' },
  content: { email: { subject: 'Summer Sale!', body: '...' }, sms: { text: 'Sale starts now!' } },
});

campaigns.launchCampaign(campaignId);
const metrics = campaigns.getCampaignMetrics(campaignId);
// → { impressions, clicks, conversions, delivered, bounced, unsubscribed }
```

### MultiChannelMessenger

Unified messaging across email, SMS, Slack, and webhooks.

| Method | Description |
|--------|-------------|
| `send(channel, recipient, message)` | Send a single message |
| `broadcast(channels, audience, message)` | Multi-channel broadcast |
| `getDeliveryStatus(messageId)` | Track delivery status and history |

Supported channels: `email`, `sms`, `slack`, `webhook`

```js
const messenger = new MultiChannelMessenger();

const { messageId } = messenger.send('email', 'user@example.com', 'Hello!');
const status = messenger.getDeliveryStatus(messageId);

messenger.broadcast(
  ['email', 'sms'],
  ['user@example.com', '+15551234567'],
  'Important update',
);
```

### ExportPipeline

Configurable ETL-style export pipelines with scheduling.

| Method | Description |
|--------|-------------|
| `createPipeline(name, source, transforms, destination)` | Define an export pipeline |
| `execute(pipelineId)` | Run the pipeline immediately |
| `schedule(pipelineId, cron)` | Schedule recurring execution |
| `getHistory(pipelineId)` | View execution history |

Transform types: `filter`, `map`, `aggregate`, `enrich`, `deduplicate`

```js
const pipeline = new ExportPipeline();

const { pipelineId } = pipeline.createPipeline(
  'Daily CRM Export',
  { type: 'connector', connectorId: 'sf-123', entity: 'contacts', sampleSize: 500 },
  [
    { type: 'filter', config: (r) => r.index < 200 },
    { type: 'enrich', config: {} },
    { type: 'deduplicate', config: { key: 'id' } },
  ],
  { type: 's3', config: { bucket: 'exports', prefix: 'crm/' } },
);

pipeline.execute(pipelineId);
pipeline.schedule(pipelineId, '0 2 * * *'); // daily at 2 AM
const history = pipeline.getHistory(pipelineId);
```

---

## Architecture

```
src/
├── index.js                  # Barrel export
├── onboarding.js             # CompanyOnboarding (3 modes)
├── campaign-manager.js       # CampaignManager
├── messaging.js              # MultiChannelMessenger
├── export-pipeline.js        # ExportPipeline
└── connectors/
    ├── index.js              # Connector barrel export
    ├── base-connector.js     # BaseConnector (abstract)
    ├── salesforce.js          # SalesforceConnector
    ├── sap.js                 # SAPConnector
    ├── google.js              # GoogleConnector
    ├── slack.js               # SlackConnector
    ├── hubspot.js             # HubSpotConnector
    ├── stripe.js              # StripeConnector
    ├── twilio.js              # TwilioConnector
    └── shopify.js             # ShopifyConnector
```

## License

**Proprietary** — Commercial license required. Per-seat or per-connector pricing.
Contact sales for licensing details.
