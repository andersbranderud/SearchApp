namespace SearchApi.Validators
{
    public interface ISearchValidator
    {
        ValidationResult ValidateSearchQuery(string query);
        ValidationResult ValidateSearchEngines(List<string> searchEngines);
    }
}
