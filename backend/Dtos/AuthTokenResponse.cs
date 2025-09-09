namespace backend.Dtos
{
    public class AuthTokenResponse
    {
        public string Token { get; set; } = string.Empty;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresIn { get; set; }

        public object? User { get; set; }
    }
}