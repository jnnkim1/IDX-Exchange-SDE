id: Identifies the query step. 1 means this is the first and only query block.

select_type: The kind of SELECT. SIMPLE means there are no subqueries or unions.

table: The table MySQL is reading: rets_property.

partitions: Which table partitions are used. NULL means this table is not partitioned.

type: The access strategy. index_merge means MySQL combines more than one index.

possible_keys: Indexes MySQL considered for the query.

key	Indexes: MySQL actually selected: the ZIP and city indexes.

key_len: How many bytes of each selected index MySQL uses.

ref: Values or columns used to look up index rows. It is NULL here because MySQL is merging indexes.

rows: MySQL’s estimate of how many index rows it must examine. This is an estimate, not an exact count.

filtered: Estimated percentage of examined rows that survive the remaining filters.

Extra: Additional work MySQL performs that does not fit the other columns.



# Database Performance Analysis

## 1. Square-foot sorting

Index:

`idx_sqft_id (LM_Int2_3, id)`

### Before index

- Access method: Full table scan
- Rows examined: 55,212
- Sort required: Yes
- Execution time: 18,298 ms

### After index

- Access method: Index scan
- Index used: `idx_sqft_id`
- Rows examined: 20
- Execution time: 26.8 ms
- Improvement: Approximately 683 times faster

## 2. Posting-date sorting

Index:

`idx_posting_date_id (OriginalEntryTimestamp, id)`

### Before index

- Access method: Full table scan
- Sort required: Yes
- Execution time: 17,772 ms

### After index

- Access method: Backward index scan
- Index used: `idx_posting_date_id`
- Rows examined: 20
- Execution time: 14.3 ms
- Improvement: Approximately 1,243 times faster

## 3. City, beds, baths, and price filtering

Index:

`idx_city_beds_baths_price
(L_City, L_Keyword2, LM_Dec_3, L_SystemPrice)`

#### Before composite index

- Indexes used: `idx_L_City`, `idx_LM_Dec_3`, `idx_L_Keyword2`
- Access method: Index merge/intersection
- Index entries scanned: approximately 32,883
- Candidate rows after intersection: 162
- Rows after remaining filters: 154
- Sort required: Yes
- Database execution time: 506 ms
- Client-reported time: 0.74 seconds
- Rows returned: 20

#### After composite index

Note: This after measurement used
`FORCE INDEX (idx_city_beds_baths_price)` because MySQL continued
choosing the three-index intersection without the hint.

- Index used: `idx_city_beds_baths_price`
- Access method: Composite index range scan
- Index entries scanned: 154
- Rows after filtering: 154
- Sort required: Yes
- Database execution time: 25.3 ms
- Client-reported time: 0.06 seconds
- Rows returned: 20
- Improvement: Approximately 20 times faster
- Execution-time reduction: Approximately 95%
- Index entries examined reduced by approximately 99.5%
