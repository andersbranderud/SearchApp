namespace SearchApi.Services
{
    public interface IExternalSearchService
    {
        Task<long> GetSearchResultCountAsync(string query, string searchEngine);
        Task<Dictionary<string, long>> SearchMultipleWordsAsync(string query, List<string> searchEngines);
    }
}
