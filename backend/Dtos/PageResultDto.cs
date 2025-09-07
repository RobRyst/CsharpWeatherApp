namespace backend.Dtos
{
    public sealed class PagedResult<T>
    {
        public required IEnumerable<T> Items { get; init; }
        public int Page { get; init; }
        public int PageSize { get; init; }
        public int TotalCount { get; init; }
    }
}