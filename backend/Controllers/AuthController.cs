using System.Security.Claims;
using backend.Auth;
using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IUserService users, ITokenService tokenService, ILogger<AuthController> logger) : ControllerBase
    {
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody] CreateUserDto req, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var created = await users.CreateAsync(req, ct);
                logger.LogInformation("User registered: {User}", created.Username);
                return CreatedAtAction(nameof(GetMe), new { }, created);
            }
            catch (InvalidOperationException ex)
            {
                logger.LogWarning(ex, "Register conflict for user {User}", req.Username);
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during Register");
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthTokenResponse>> Login([FromBody] LoginDto req, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var (ok, user, role) = await users.ValidateCredentialsAsync(req.UsernameOrEmail, req.Password, ct);
                if (!ok || user is null)
                    return Unauthorized(new { error = "invalid credentials" });

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, role ?? "User")
                };

                var jwt = tokenService.CreateToken(claims);
                logger.LogInformation("Issued token for {User}", user.Username);

                return Ok(new AuthTokenResponse
                {
                    Token = jwt,
                    TokenType = "Bearer",
                    ExpiresIn = 60 * 60,
                    User = new
                    {
                        user.Id,
                        user.Username,
                        user.Email,
                        Role = role ?? "User"
                    }
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during Login");
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public ActionResult<object> GetMe()
        {
            try
            {
                var me = new
                {
                    id = User.FindFirstValue(ClaimTypes.NameIdentifier),
                    username = User.Identity?.Name,
                    email = User.FindFirstValue(ClaimTypes.Email),
                    role = User.FindFirstValue(ClaimTypes.Role)
                };
                return Ok(me);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in GetMe");
                return StatusCode(500, new { error = "internal server error" });
            }
        }
    }
}
