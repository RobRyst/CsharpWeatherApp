using System.Security.Claims;
using backend.Domains.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(ITokenService tokenService, ILogger<AuthController> logger) : ControllerBase
    {
        public record LoginRequest(string Username, string Password);
        public record TokenResponse(string AccessToken, string TokenType, int ExpiresIn);

        [AllowAnonymous]
        [HttpPost("token")]
        public IActionResult CreateToken([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { error = "username and password are required" });

            if (!(req.Username == "admin" && req.Password == "weather"))
                return Unauthorized(new { error = "invalid credentials" });

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, req.Username),
                new Claim(ClaimTypes.Name, req.Username),
                new Claim(ClaimTypes.Role, "Admin")
            };

            var jwt = tokenService.CreateToken(claims);
            logger.LogInformation("Issued token for {User}", req.Username);
            return Ok(new TokenResponse(jwt, "Bearer", 60 * 60));
        }
    }
}
