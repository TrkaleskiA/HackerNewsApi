using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNewsApi.Services.ServicesInterfaces;

namespace HackerNewsApi.Services
{
    public class PartService : IPartService
    {
        private readonly IPartRepository _repository;

        public PartService(IPartRepository repository)
        {
            _repository = repository;
        }

        public Task<Part> GetPartByIdAsync(long id)
        {
            return _repository.GetPartByIdAsync(id);
        }

        public Task<IEnumerable<Part>> GetAllPartsAsync()
        {
            return _repository.GetAllPartsAsync();
        }

        public async Task AddPartsAsync(IEnumerable<Part> parts)
        {
            foreach (var part in parts)
            {
                // Perform necessary validation or adjustments here if needed
                if (part.PollId <= 0)
                {
                    throw new ArgumentException("PollId is required.");
                }
            }

            await _repository.AddPartsAsync(parts);
        }


        public Task UpdatePartAsync(Part part)
        {
            return _repository.UpdatePartAsync(part);
        }

        public Task DeletePartAsync(long id)
        {
            return _repository.DeletePartAsync(id);
        }

        // Retrieve all parts for a specific poll
        public async Task<IEnumerable<Part>> GetPartsByPollIdAsync(long pollId)
        {
            return await _repository.GetPartsByPollIdAsync(pollId);
        }
    }
}
