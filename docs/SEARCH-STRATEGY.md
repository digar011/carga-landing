# Search and Filtering Strategy

> CarGA's load board uses server-side filtering via Supabase queries, trigram-based fuzzy text search, and Supabase Realtime for live updates. Designed for the MVP scale (thousands of loads) with a clear upgrade path for higher volumes.

## Overview

```
Client (LoadFilters)          Server (Supabase)              Database (PostgreSQL)
+-------------------+        +-------------------+          +-------------------+
| Text search       | -----> | .ilike() /        | -------> | pg_trgm GIN       |
| Province filter   |        | .eq() / .gte()    |          | indexes           |
| Truck type filter |        | .order()          |          | Composite indexes |
| Cargo type filter |        | .range()          |          | Partial indexes   |
| Weight range      |        |                   |          |                   |
| Rate range        |        | Realtime channel  | <------> | supabase_realtime |
| Sort option       |        | (INSERT/DELETE)   |          | publication       |
+-------------------+        +-------------------+          +-------------------+
```

## Text Search

### How It Works

Text search targets three columns on the `loads` table:

| Column | Description | Example |
|--------|-------------|---------|
| `origen_ciudad` | Origin city name | "Buenos Aires", "Rosario" |
| `destino_ciudad` | Destination city name | "Córdoba", "Mendoza" |
| `descripcion_carga` | Cargo description | "Soja a granel", "Materiales de construcción" |

Queries use PostgreSQL's `ILIKE` for case-insensitive matching, backed by `pg_trgm` trigram indexes for performance.

### Database Indexes

The `pg_trgm` extension is enabled in migration `20250326000001`:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_loads_origen_ciudad_trgm
  ON loads USING gin (origen_ciudad gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_loads_destino_ciudad_trgm
  ON loads USING gin (destino_ciudad gin_trgm_ops);
```

Trigram indexes enable:
- **Fuzzy matching:** "Benos Aires" still matches "Buenos Aires"
- **Substring matching:** "Rosa" matches "Rosario"
- **Case-insensitive search** without full table scans

### Example Query

```typescript
let query = supabase
  .from('loads')
  .select('*')
  .eq('estado', 'publicada');

if (searchTerm) {
  query = query.or(
    `origen_ciudad.ilike.%${searchTerm}%,` +
    `destino_ciudad.ilike.%${searchTerm}%,` +
    `descripcion_carga.ilike.%${searchTerm}%`
  );
}
```

## Available Filters

All filtering is done server-side via Supabase query builders.

| Filter | Column | Type | Example Values |
|--------|--------|------|----------------|
| Province | `origen_provincia` | Exact match (`.eq()`) | "Buenos Aires", "Córdoba", "Santa Fe" |
| Truck type | `tipo_camion_requerido` | Exact match (`.eq()`) | `semirremolque`, `volcador`, `chasis`, `furgon`, `refrigerado`, `cisterna`, `portacontenedor`, `batea` |
| Cargo type | `tipo_carga` | Exact match (`.eq()`) | `granel`, `paletizada`, `refrigerada`, `peligrosa`, `maquinaria`, `vehiculos`, `contenedor`, `general` |
| Min weight | `peso_tn` | Greater than or equal (`.gte()`) | 5, 10, 20 |
| Max weight | `peso_tn` | Less than or equal (`.lte()`) | 30, 50, 100 |
| Min rate | `tarifa_ars` | Greater than or equal (`.gte()`) | 50000, 100000 |
| Max rate | `tarifa_ars` | Less than or equal (`.lte()`) | 500000, 1000000 |

### Filter Composition

Filters are additive (AND logic). Each filter narrows the result set:

```typescript
let query = supabase
  .from('loads')
  .select('*')
  .eq('estado', 'publicada');

if (filters.provincia) {
  query = query.eq('origen_provincia', filters.provincia);
}
if (filters.tipoCamion) {
  query = query.eq('tipo_camion_requerido', filters.tipoCamion);
}
if (filters.tipoCarga) {
  query = query.eq('tipo_carga', filters.tipoCarga);
}
if (filters.pesoMin) {
  query = query.gte('peso_tn', filters.pesoMin);
}
if (filters.pesoMax) {
  query = query.lte('peso_tn', filters.pesoMax);
}
if (filters.tarifaMin) {
  query = query.gte('tarifa_ars', filters.tarifaMin);
}
if (filters.tarifaMax) {
  query = query.lte('tarifa_ars', filters.tarifaMax);
}
```

## Sort Options

| Option | Column + Direction | Use Case |
|--------|--------------------|----------|
| Newest first (default) | `created_at DESC` | See latest loads first |
| Highest rate | `tarifa_ars DESC` | Find best-paying loads |
| Lowest weight | `peso_tn ASC` | Find lighter loads for smaller trucks |

```typescript
query = query.order(sortField, { ascending: sortAscending });
```

## Pagination

All list endpoints use limit/offset pagination:

```typescript
const PAGE_SIZE = 20;

query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

The response includes a total count via Supabase's `count` option:

```typescript
const { data, count } = await supabase
  .from('loads')
  .select('*', { count: 'exact' })
  .eq('estado', 'publicada')
  .range(0, 19);
```

## Performance Indexes

The following composite and partial indexes optimize the most common queries:

| Index | Columns | Condition | Purpose |
|-------|---------|-----------|---------|
| `idx_loads_board_query` | `(estado, created_at DESC)` | `WHERE estado = 'publicada'` | Default load board listing |
| `idx_loads_province_truck` | `(origen_provincia, tipo_camion_requerido)` | `WHERE estado = 'publicada'` | Province + truck type filter combo |
| `idx_loads_origen_ciudad_trgm` | `origen_ciudad` (GIN trigram) | — | Fuzzy text search on origin city |
| `idx_loads_destino_ciudad_trgm` | `destino_ciudad` (GIN trigram) | — | Fuzzy text search on destination city |
| `idx_applications_pending` | `(load_id)` | `WHERE estado = 'pendiente'` | Pending application count for cargador dashboard |

## Client-Side: LoadFilters Component

The `LoadFilters` component provides the user interface for search and filtering:

- **Debounced text search:** 300ms debounce on keystroke to avoid excessive API calls
- **Collapsible on mobile:** Filters collapse behind a toggle button on small screens to maximize load board visibility
- **URL sync:** Filter state is synced to URL query params so users can share filtered views
- **Reset button:** Clears all filters and returns to the default view

## Real-Time Updates

CarGA uses Supabase Realtime to keep the load board live without polling.

### How It Works

Migration `20250326000001` enables Realtime on key tables:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE loads;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE load_applications;
```

### Client Subscription

```typescript
const channel = supabase
  .channel('load-board')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'loads',
    filter: 'estado=eq.publicada',
  }, (payload) => {
    // Add new load to the board in real time
    addLoadToBoard(payload.new);
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'loads',
  }, (payload) => {
    // Update or remove load if status changed
    updateLoadOnBoard(payload.new);
  })
  .subscribe();
```

This means:
- When a cargador publishes a new load, it appears on all connected transportista boards instantly
- When a load is assigned or cancelled, it disappears from the board without a page refresh

## Future: Full-Text Search Engine

When data volume grows beyond what `pg_trgm` handles efficiently (roughly 100K+ loads), consider migrating to a dedicated search engine:

| Option | Pros | Cons |
|--------|------|------|
| **Typesense** | Simple setup, typo tolerance, fast, open source, free self-hosted | Requires separate infrastructure |
| **Elasticsearch** | Industry standard, powerful aggregations | Complex, resource-heavy, expensive |
| **Meilisearch** | Fast, developer-friendly, great defaults | Newer, smaller community |

### Migration Path

1. Keep Supabase as the source of truth
2. Sync load data to the search engine via database webhooks or a background job
3. Route search queries to the search engine, detail queries to Supabase
4. The client-side component and API contract remain the same — only the backend implementation changes
