const DEFAULT_SORT = {
  sortBy: 'id',
  sortOrder: 'ASC',
};

export default function PropertySort({
  onSubmit,
  value = DEFAULT_SORT,
}) {
  function handleSortChange(event) {
    const [sortBy, sortOrder] = event.target.value.split(':');

    onSubmit({
      sortBy,
      sortOrder,
    });
  }

  const selectedValue = `${value.sortBy}:${value.sortOrder}`;

  return (
    <div className="property-sort">
      <label htmlFor="sortBy">Sort by</label>

      <select
        id="sortBy"
        name="sortBy"
        value={selectedValue}
        onChange={handleSortChange}
      >
        <option value="id:ASC">
          Default
        </option>

        <option value="L_SystemPrice:ASC">
          Price: Low to High
        </option>

        <option value="L_SystemPrice:DESC">
          Price: High to Low
        </option>

        <option value="OriginalEntryTimestamp:DESC">
          Posting: Latest First
        </option>

        <option value="OriginalEntryTimestamp:ASC">
          Posting: Earliest First
        </option>

        <option value="LM_Int2_3:ASC">
          Square Feet: Low to High
        </option>

        <option value="LM_Int2_3:DESC">
          Square Feet: High to Low
        </option>
      </select>
    </div>
  );
}