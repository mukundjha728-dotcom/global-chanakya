# Semantic Link Investigation

The previous audit reported 26 "invalid" relationships out of 94 in the 20-article sample. Investigation reveals this is due to a discrepancy between the validator script and the actual implementation of `getCachedRelatedBlogs`.

**Root Cause**: The implementation query uses an `$or` operator that includes:
`{ tags: { $in: blog.tags || [] } }`
The validator script only checked formal entity arrays (topics, countries, leaders, regions, conflicts) and the primary category, but missed the legacy string `tags` array. Therefore, the relationships are genuinely valid according to the code, but were falsely flagged by the validator.

### Sample of "Invalid" Relationships Explained:
- **Source**: `strait-of-hormuz-crisis-2026`
  - **Target**: `asean-role-global-stability-2026`
  - **Reason**: Shared legacy 'tags' array (Geopolitics)
- **Source**: `strait-of-hormuz-crisis-2026`
  - **Target**: `russia-ukraine-war-timeline-strategic-analysis-2026`
  - **Reason**: Shared legacy 'tags' array (Geopolitics)
- **Source**: `china-long-term-global-expansion-strategy-2026`
  - **Target**: `global-debt-bomb-sovereign-debt-geopolitical-weapon`
  - **Reason**: Shared legacy 'tags' array (Belt and Road Initiative)
- **Source**: `china-long-term-global-expansion-strategy-2026`
  - **Target**: `xi-cairo-visit-china-fills-middle-east-vacuum`
  - **Reason**: Shared legacy 'tags' array (Belt and Road Initiative,Xi Jinping)
- **Source**: `nato-future-unstable-europe-2026`
  - **Target**: `what-is-nato-future-geopolitical-analysis`
  - **Reason**: Shared legacy 'tags' array (NATO,European Strategic Autonomy,Article 5)
- **Source**: `nato-future-unstable-europe-2026`
  - **Target**: `why-south-china-sea-matters-global-strategy-2026`
  - **Reason**: Shared legacy 'tags' array (Defence,Strategic Affairs)
- **Source**: `australia-strategic-role-against-china-2026`
  - **Target**: `pacific-islands-forum-china-taiwan-battleground-2026`
  - **Reason**: Shared legacy 'tags' array (Australia,China,Taiwan)
