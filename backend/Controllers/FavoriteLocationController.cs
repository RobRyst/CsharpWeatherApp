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
        public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetMine(CancellationToken ct)
        {
            var id = CurrentUserId;
            if (id is null) return Unauthorized();
            var items = await favorites.GetMineAsync(id.Value, ct);
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<FavoriteDto>> Create([FromBody] CreateFavoriteRequest req, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var id = CurrentUserId;
            if (id is null) return Unauthorized();

            try
            {
                var created = await favorites.CreateAsync(id.Value, req, ct);
                return CreatedAtAction(nameof(GetMine), new { }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        [HttpDelete("{favoriteId:int}")]
        public async Task<IActionResult> Delete(int favoriteId, CancellationToken ct)
        {
            var id = CurrentUserId;
            if (id is null) return Unauthorized();

            var ok = await favorites.DeleteAsync(id.Value, favoriteId, ct);
            return ok ? NoContent() : NotFound();
        }
    }
}
