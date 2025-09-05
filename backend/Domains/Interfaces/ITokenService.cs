using System.Security.Claims;

namespace backend.Domains.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(IEnumerable<Claim> claims);
    }
}
