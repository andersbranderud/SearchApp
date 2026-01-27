using Xunit;
using Newtonsoft.Json.Linq;
using SearchApi.Services;

namespace SearchApi.Tests.Services
{
    public class SearchResultExtractorTests
    {
        private readonly SearchResultExtractor _extractor;

        public SearchResultExtractorTests()
        {
            _extractor = new SearchResultExtractor();
        }

        #region TryExtractFromSearchInformation Tests

        [Fact]
        public void TryExtractFromSearchInformation_ValidJson_ReturnsCorrectCount()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': 123456789
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(123456789, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_StringNumber_ReturnsCorrectCount()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': '987654321'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(987654321, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_NumberWithCommas_RemovesCommasAndReturnsCount()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': '1,234,567,890'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(1234567890, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_NullJson_ReturnsZero()
        {
            // Act
            var result = _extractor.TryExtractFromSearchInformation(null);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_MissingSearchInformation_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': []
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_NullTotalResults_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'other_field': 'value'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_InvalidNumberFormat_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': 'not a number'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_ZeroResults_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': 0
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_EmptyString_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': ''
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(0, result);
        }

        #endregion

        #region EstimateFromOrganicResults Tests

        [Fact]
        public void EstimateFromOrganicResults_ValidResults_ReturnsEstimate()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': [
                    {'title': 'Result 1'},
                    {'title': 'Result 2'},
                    {'title': 'Result 3'},
                    {'title': 'Result 4'},
                    {'title': 'Result 5'}
                ]
            }");
            var multiplier = 10000;

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, multiplier);

            // Assert
            Assert.Equal(50000, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_NullJson_ReturnsZero()
        {
            // Act
            var result = _extractor.EstimateFromOrganicResults(null, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_ZeroMultiplier_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': [
                    {'title': 'Result 1'}
                ]
            }");

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, 0);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_NegativeMultiplier_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': [
                    {'title': 'Result 1'}
                ]
            }");

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, -100);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_EmptyArray_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': []
            }");

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_MissingOrganicResults_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {}
            }");

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_NotAnArray_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': 'not an array'
            }");

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_SingleResult_ReturnsMultiplier()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': [
                    {'title': 'Single Result'}
                ]
            }");
            var multiplier = 50000;

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, multiplier);

            // Assert
            Assert.Equal(50000, result);
        }

        #endregion

        #region TryExtractFromAnswerBox Tests

        [Fact]
        public void TryExtractFromAnswerBox_ValidNumber_ReturnsCorrectCount()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': '42'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(42, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_NumberWithCommas_RemovesCommasAndReturnsCount()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': '1,234,567'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(1234567, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_NumberWithSpaces_RemovesSpacesAndReturnsCount()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': '  999  '
                }
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(999, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_NullJson_ReturnsZero()
        {
            // Act
            var result = _extractor.TryExtractFromAnswerBox(null);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_MissingAnswerBox_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {}
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_InvalidFormat_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': 'not a number'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_EmptyResult_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': ''
                }
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(0, result);
        }

        #endregion

        #region ExtractResultCount Integration Tests

        [Fact]
        public void ExtractResultCount_SearchInformationPresent_UsesSearchInformation()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': 1000000
                },
                'organic_results': [
                    {'title': 'Result 1'},
                    {'title': 'Result 2'}
                ]
            }");

            // Act
            var result = _extractor.ExtractResultCount(json, 50000);

            // Assert
            Assert.Equal(1000000, result); // Should use search_information, not estimate
        }

        [Fact]
        public void ExtractResultCount_NoSearchInformation_FallsBackToAnswerBox()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': '500000'
                },
                'organic_results': [
                    {'title': 'Result 1'}
                ]
            }");

            // Act
            var result = _extractor.ExtractResultCount(json, 100000);

            // Assert
            Assert.Equal(500000, result); // Should use answer_box
        }

        [Fact]
        public void ExtractResultCount_NoDirectCount_EstimatesFromOrganic()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'organic_results': [
                    {'title': 'Result 1'},
                    {'title': 'Result 2'},
                    {'title': 'Result 3'}
                ]
            }");

            // Act
            var result = _extractor.ExtractResultCount(json, 10000);

            // Assert
            Assert.Equal(30000, result); // 3 results * 10000 multiplier
        }

        [Fact]
        public void ExtractResultCount_NullJson_ReturnsZero()
        {
            // Act
            var result = _extractor.ExtractResultCount(null, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void ExtractResultCount_EmptyJson_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{}");

            // Act
            var result = _extractor.ExtractResultCount(json, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void ExtractResultCount_AllStrategiesFail_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'unrelated_field': 'value'
            }");

            // Act
            var result = _extractor.ExtractResultCount(json, 10000);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void ExtractResultCount_PriorityOrder_PrefersSearchInformation()
        {
            // Arrange - All three strategies have data
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': 100
                },
                'answer_box': {
                    'result': '200'
                },
                'organic_results': [
                    {'title': 'Result 1'}
                ]
            }");

            // Act
            var result = _extractor.ExtractResultCount(json, 50000);

            // Assert
            Assert.Equal(100, result); // Should prefer search_information
        }

        [Fact]
        public void ExtractResultCount_SecondPriority_PrefersAnswerBoxOverEstimate()
        {
            // Arrange - Answer box and organic results available
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': '300'
                },
                'organic_results': [
                    {'title': 'Result 1'}
                ]
            }");

            // Act
            var result = _extractor.ExtractResultCount(json, 50000);

            // Assert
            Assert.Equal(300, result); // Should prefer answer_box over estimate
        }

        #endregion

        #region Edge Cases and Error Handling

        [Fact]
        public void TryExtractFromSearchInformation_MalformedJson_ReturnsZero()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': null
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void EstimateFromOrganicResults_LargeArray_CalculatesCorrectly()
        {
            // Arrange
            var resultsArray = new JArray();
            for (int i = 0; i < 100; i++)
            {
                resultsArray.Add(new JObject { ["title"] = $"Result {i}" });
            }
            var json = new JObject { ["organic_results"] = resultsArray };

            // Act
            var result = _extractor.EstimateFromOrganicResults(json, 1000);

            // Assert
            Assert.Equal(100000, result);
        }

        [Fact]
        public void TryExtractFromAnswerBox_NumericType_HandlesCorrectly()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'answer_box': {
                    'result': 777
                }
            }");

            // Act
            var result = _extractor.TryExtractFromAnswerBox(json);

            // Assert
            Assert.Equal(777, result);
        }

        [Fact]
        public void TryExtractFromSearchInformation_VeryLargeNumber_HandlesCorrectly()
        {
            // Arrange
            var json = JObject.Parse(@"{
                'search_information': {
                    'total_results': '999999999999'
                }
            }");

            // Act
            var result = _extractor.TryExtractFromSearchInformation(json);

            // Assert
            Assert.Equal(999999999999, result);
        }

        #endregion
    }
}
