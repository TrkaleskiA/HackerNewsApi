using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository.RepositoryInterfaces
{
    public interface IPartRepository
    {
        Task<Part> GetPartByIdAsync(long id);
        Task<IEnumerable<Part>> GetAllPartsAsync();
        Task AddPartsAsync(IEnumerable<Part> parts);
        Task UpdatePartAsync(Part part);
        Task DeletePartAsync(long id);

        // New method for retrieving parts by poll ID
        Task<IEnumerable<Part>> GetPartsByPollIdAsync(long pollId);
    }
}
