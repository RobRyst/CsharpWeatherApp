using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController(IUserService users, ILogger<UsersController> logger) : ControllerBase
    {
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetById(int id, CancellationToken ct = default)
        {
            try
            {
                var user = await users.GetByIdAsync(id, ct);
                if (user is null)
                {
                    logger.LogInformation("GetById: user {UserId} not found", id);
                    return NotFound();
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error fetching user {UserId}", id);
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto req, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var created = await users.CreateAsync(req, ct);
                logger.LogInformation("Created user {User} (id {UserId})", created.Username, created.Id);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                logger.LogWarning(ex, "Create conflict for user {User}", req?.Username);
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error creating user {User}", req?.Username);
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto req, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var updated = await users.UpdateAsync(id, req, ct);
                if (updated is null)
                {
                    logger.LogInformation("Update: user {UserId} not found", id);
                    return NotFound();
                }

                logger.LogInformation("Updated user {UserId}", id);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                logger.LogWarning(ex, "Update conflict for user {UserId}", id);
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error updating user {UserId}", id);
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
        {
            try
            {
                var ok = await users.DeleteAsync(id, ct);
                if (!ok)
                {
                    logger.LogInformation("Delete: user {UserId} not found", id);
                    return NotFound();
                }

                logger.LogInformation("Deleted user {UserId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error deleting user {UserId}", id);
                return StatusCode(500, new { error = "internal server error" });
            }
        }
    }
}
