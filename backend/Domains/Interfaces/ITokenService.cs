using System.Security.Claims;

namespace backend.Auth
{
    public interface ITokenService
    {
        string CreateToken(IEnumerable<Claim> claims);
    }
}
