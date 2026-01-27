namespace SearchApi.Models
{
    public class SearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public List<string> SearchEngines { get; set; } = new();
    }
}
