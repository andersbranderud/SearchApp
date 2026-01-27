using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SearchApi.Models;
using SearchApi.Services;
using SearchApi.Validators;

namespace SearchApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly IExternalSearchService _externalSearchService;
        private readonly ISearchValidator _validator;

        public SearchController(IExternalSearchService externalSearchService, ISearchValidator validator)
        {
            _externalSearchService = externalSearchService;
            _validator = validator;
        }

        [HttpPost]
        public async Task<ActionResult<SearchResult>> Search([FromBody] SearchRequest request)
        {
            // Validate search query
            var queryValidation = _validator.ValidateSearchQuery(request.Query);
            if (!queryValidation.IsValid)
            {
                return BadRequest(new { message = queryValidation.ErrorMessage });
            }

            // Validate search engines
            var enginesValidation = _validator.ValidateSearchEngines(request.SearchEngines);
            if (!enginesValidation.IsValid)
            {
                return BadRequest(new { message = enginesValidation.ErrorMessage });
            }

            // Perform searches - each word separately, sum results per engine
            var engineResults = await _externalSearchService.SearchMultipleWordsAsync(request.Query, request.SearchEngines);

            var result = new SearchResult
            {
                Query = request.Query,
                SearchEngines = request.SearchEngines,
                EngineTotals = engineResults
            };

            return Ok(result);
        }

        [HttpGet("engines")]
        public ActionResult<List<string>> GetAvailableEngines()
        {
            return Ok(new List<string> 
            { 
                "Google", "Bing", "Yahoo", "DuckDuckGo", "Baidu", "Yandex" 
            });
        }
    }
}
