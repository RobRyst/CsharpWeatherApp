namespace backend.Dtos
{
    public sealed class AuthTokenResponse
    {
        public required string AccessToken { get; init; }
        public string TokenType { get; init; } = "Bearer";
        public int ExpiresIn { get; init; } = 3600;
    }
}