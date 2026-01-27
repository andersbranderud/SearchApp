namespace SearchApi.Models
{
    public class SearchResult
    {
        public string Query { get; set; } = string.Empty;
        public List<string> SearchEngines { get; set; } = new();
        public Dictionary<string, long> EngineTotals { get; set; } = new();
    }
}
