using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services.ServicesInterfaces
{
    public interface IPartService
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
