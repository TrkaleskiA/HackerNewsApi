using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository
{
    public class PartRepository : IPartRepository
    {
        private readonly ApplicationDbContext _context;

        public PartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Part> GetPartByIdAsync(long id)
        {
            return await _context.Set<Part>().FindAsync(id);
        }

        public async Task<IEnumerable<Part>> GetAllPartsAsync()
        {
            return await _context.Set<Part>().ToListAsync();
        }

        public async Task AddPartsAsync(IEnumerable<Part> parts)
        {
            foreach (var part in parts)
            {
                if (part.PollId <= 0)
                {
                    throw new ArgumentException("PollId is required.");
                }

                // Ensure that the PollId exists
                var exists = await _context.Set<Story>().AnyAsync(s => s.Id == part.PollId);
                if (!exists)
                {
                    throw new ArgumentException($"Poll with Id {part.PollId} does not exist.");
                }
            }

            await _context.Set<Part>().AddRangeAsync(parts);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePartAsync(Part part)
        {
            _context.Set<Part>().Update(part);
            await _context.SaveChangesAsync();
        }

        public async Task DeletePartAsync(long id)
        {
            var part = await GetPartByIdAsync(id);
            if (part != null)
            {
                _context.Set<Part>().Remove(part);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Part>> GetPartsByPollIdAsync(long pollId)
        {
            return await _context.Set<Part>()
                .Where(p => p.PollId == pollId)
                .ToListAsync();
        }
    }
}
