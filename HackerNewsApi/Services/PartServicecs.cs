using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.Api.Services
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

        public Task AddPartsAsync(IEnumerable<Part> parts)
        {
            return _repository.AddPartsAsync(parts);
        }

        public Task UpdatePartAsync(Part part)
        {
            return _repository.UpdatePartAsync(part);
        }

        public Task DeletePartAsync(long id)
        {
            return _repository.DeletePartAsync(id);
        }
    }
}
