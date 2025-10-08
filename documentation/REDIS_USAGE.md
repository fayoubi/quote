# Redis Usage in Pricing Service

## Overview

Redis is used as a **caching layer** to improve performance by reducing database queries. It complements PostgreSQL rather than replacing it.

## What Redis Caches

### 1. Generated Quotes (Ephemeral)
- **Key Pattern**: `quote:{quoteId}`
- **TTL**: Same as quote expiration (30 days)
- **Purpose**: Fast retrieval of previously generated quotes
- **Cache Strategy**: Write-through

### 2. Rate Tables (Future Enhancement)
- **Key Pattern**: `rate:{productType}:{riskClass}:{gender}:{age}:{termLength}`
- **TTL**: 1 hour (3600 seconds)
- **Purpose**: Cache actuarial rates to avoid DB queries
- **Status**: ⚠️ Not currently implemented in quote calculation

## Quote Generation Flow

When you generate a quote, here's what happens:

```
1. POST /api/v1/quotes/calculate
   ↓
2. Validate product is enabled (environment variable)
   ↓
3. PricingEngine calculates quote using:
   - Hardcoded rate logic (in-memory calculations)
   - NO database queries
   - NO Redis queries
   ↓
4. Quote calculated and returned immediately
   ↓
5. Quote is NOT saved (ephemeral mode)
   - Not stored in PostgreSQL
   - Not cached in Redis
```

### ⚠️ Important Discovery

**During quote calculation, NEITHER PostgreSQL NOR Redis is queried!**

The current implementation uses **hardcoded rate logic** in `PricingEngine.ts`:
- Risk class determination: Based on age, BMI, nicotine use
- Base rates: Hardcoded lookup table (see `baseMaleRates` object)
- Adjustments: Age multipliers, gender factors, term length calculated in-memory

```typescript
// From PricingEngine.ts line 172-181
private getBaseRate(riskClass: string, gender: string, age: number, termLength: number): number {
  const baseMaleRates: Record<string, number> = {
    'SuperPreferredPlus': 0.8,
    'SuperPreferred': 1.0,
    'PreferredPlus': 1.2,
    'Preferred': 1.5,
    'StandardPlus': 2.0,
    'Standard': 2.5,
    'Substandard': 4.0
  };
  // ... calculations done in-memory ...
}
```

### What Database Tables Are Actually Used

**PostgreSQL tables created but NOT used for quote calculation:**
- ❌ `products` table - Not queried during calculation
- ❌ `rate_tables` - 40 actuarial rates stored but NOT used
- ❌ `quotes` table - Quotes not persisted (ephemeral mode)

**Redis:**
- ❌ Not used for quote calculation
- ❌ Not used for quote storage (ephemeral mode)

## Retrieving Existing Quotes

When you fetch a previously generated quote:

```
GET /api/v1/quotes/{quoteId}
   ↓
1. Check Redis cache
   └─ HIT → Return cached quote ⚡ (fast)
   └─ MISS ↓
2. Query PostgreSQL
   └─ Found → Cache in Redis + Return
   └─ Not Found → 404 Error
```

### Cache-Aside Pattern

This is a classic **cache-aside** (lazy-loading) strategy:
1. Check cache first
2. On cache miss, query database
3. Populate cache for next request

## Performance Impact

### Current State
- **Quote Calculation**: Direct PostgreSQL queries (~50-100ms)
- **Quote Retrieval**: Redis cache hit (~1-5ms) or PostgreSQL fallback (~20-50ms)

### Potential Optimization

Rate tables could be cached to improve quote calculation speed:

```typescript
// DatabaseService.ts - getRateTable() could use Redis
async getRateTable(...) {
  // 1. Check Redis cache
  const cacheKey = `rate:${productType}:${riskClass}:${gender}:${age}:${termLength}`;
  const cached = await redisService.getRateTable(cacheKey);
  if (cached) return cached;

  // 2. Query PostgreSQL
  const rateTable = await pool.query(...);

  // 3. Cache for 1 hour
  await redisService.cacheRateTable(cacheKey, rateTable, 3600);

  return rateTable;
}
```

This would reduce quote calculation time from ~50ms to ~5ms for cached rates.

## Redis Health Check

The `/api/v1/health/deep` endpoint checks Redis connectivity:

```bash
curl http://localhost:3001/api/v1/health/deep
```

Response includes Redis status:
```json
{
  "checks": {
    "redis": {
      "status": "healthy",
      "responseTime": 2.1
    }
  }
}
```

## When Redis is Unavailable

The service **gracefully degrades**:
- Quote calculation continues (uses PostgreSQL only)
- Quotes are not cached
- Quote retrieval falls back to PostgreSQL
- Performance impact: ~20-50ms slower per request

No errors are thrown - Redis failures are logged but don't break the service.

## Connecting to Redis

```bash
# Using redis-cli
docker-compose exec pricing-redis redis-cli

# Check cached quotes
KEYS quote:*

# View a specific quote
GET quote:quote_term_1703174245123_a1b2c3

# Check rate table cache (if implemented)
KEYS rate:*

# Monitor Redis in real-time
MONITOR
```

## Summary

| Operation | Data Source | Redis Role | PostgreSQL Role |
|-----------|-------------|------------|-----------------|
| Generate Quote | **Hardcoded in-memory logic** | ❌ Not used | ❌ Not used |
| Save Quote | Not saved (ephemeral) | ❌ Disabled | ❌ Disabled |
| Retrieve Quote | Not available (ephemeral) | ❌ Disabled | ❌ Disabled |
| Rate Lookup | Hardcoded rates in code | ❌ Not used | ❌ Not used |

**Bottom Line**:
- Quote generation = **Pure in-memory calculations** (no database, no cache)
- Quote retrieval = **Not supported** (ephemeral mode - quotes not saved)
- Redis = **Currently unused** in production flow
- PostgreSQL = **Tables exist but not queried** during quote flow

### Why Have Database Tables?

The `products` and `rate_tables` exist for **future enhancement** when:
1. Actuarial rates need to be updated without code changes
2. Multiple products need dynamic configuration
3. Quotes need to be persisted for auditing/retrieval
4. Rate changes need to be versioned with effective dates

Currently: **All logic is hardcoded for simplicity and speed** ⚡
