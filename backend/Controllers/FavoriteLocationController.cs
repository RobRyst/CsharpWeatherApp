using System.Security.Claims;
using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController(IFavoriteLocationService favorites, ILogger<FavoritesController> logger) : ControllerBase
    {
        private int? CurrentUserId =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoriteLocationDto>>> GetMine(CancellationToken ct)
        {
            try
            {
                var id = CurrentUserId;
                if (id is null) return Unauthorized();

                var items = await favorites.GetMineAsync(id.Value, ct);
                return Ok(items);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error fetching favorites for current user");
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<FavoriteLocationDto>> Create([FromBody] CreateFavoriteRequest req, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var id = CurrentUserId;
                if (id is null) return Unauthorized();

                var created = await favorites.CreateAsync(id.Value, req, ct);
                return CreatedAtAction(nameof(GetMine), new { }, created);
            }
            catch (InvalidOperationException ex)
            {
                logger.LogWarning(ex, "Favorite create conflict for {Name} ({Lat},{Lon})",
                    req?.Name, req?.Latitude, req?.Longitude);
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error creating favorite");
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpDelete("{favoriteId:int}")]
        public async Task<IActionResult> Delete(int favoriteId, CancellationToken ct)
        {
            try
            {
                var id = CurrentUserId;
                if (id is null) return Unauthorized();

                var ok = await favorites.DeleteAsync(id.Value, favoriteId, ct);
                if (!ok)
                {
                    logger.LogInformation("Favorite {FavoriteId} not found (user {UserId})", favoriteId, id);
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error deleting favorite {FavoriteId}", favoriteId);
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpPatch("{favoriteId:int}/default")]
        public async Task<IActionResult> SetDefault(int favoriteId, CancellationToken ct)
        {
            try
            {
                var id = CurrentUserId;
                if (id is null) return Unauthorized();

                var ok = await favorites.SetDefaultAsync(id.Value, favoriteId, ct);
                if (!ok)
                {
                    logger.LogInformation("SetDefault: favorite {FavoriteId} not found (user {UserId})", favoriteId, id);
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error setting default favorite {FavoriteId}", favoriteId);
                return StatusCode(500, new { error = "internal server error" });
            }
        }
    }
}
