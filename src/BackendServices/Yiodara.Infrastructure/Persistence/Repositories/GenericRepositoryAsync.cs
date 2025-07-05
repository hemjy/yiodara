using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Infrastructure.Persistence.Contexts;

namespace Yiodara.Infrastructure.Persistence.Repositories
{
    public class GenericRepositoryAsync<T> : IGenericRepositoryAsync<T> where T : class
    {
        private readonly ApplicationDbContext _dbContext;
        readonly DbSet<T> table;
        public GenericRepositoryAsync(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
            table = _dbContext.Set<T>();
        }

        public virtual async Task<T> GetByIdAsync<V>(V id) => await _dbContext.Set<T>().FindAsync(id);

        public async Task<IReadOnlyList<T>> GetPagedResponseAsync(int pageNumber, int pageSize)
        {
            return await _dbContext
                .Set<T>()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<T> AddAsync(T entity, bool commit = true)
        {
            await _dbContext.Set<T>().AddAsync(entity);
            if (commit) await _dbContext.SaveChangesAsync();
            return entity;
        }

        public async Task<List<T>> AddAsync(List<T> entities, bool commit = true)
        {
            await _dbContext.Set<T>().AddRangeAsync(entities);
            if (commit) await _dbContext.SaveChangesAsync();
            return entities;
        }

        public async Task SaveChangesAsync()
        {
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(T entity, bool commit = true)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            if (commit) await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(List<T> entities, bool commit = true)
        {
            _dbContext.Entry(entities).State = EntityState.Modified;
            if (commit) await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(T entity, bool commit = true)
        {
            _dbContext.Set<T>().Remove(entity);
            if (commit) await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(List<T> entities, bool commit = true)
        {
            _dbContext.Set<T>().RemoveRange(entities);
            if (commit) await _dbContext.SaveChangesAsync();
        }



        public async Task<IReadOnlyList<T>> GetAllAsync()
        {
            return await _dbContext
                 .Set<T>()
                 .ToListAsync();
        }

        public Task<bool> IsUniqueAsync(Expression<Func<T, bool>> predicate) => _dbContext.Set<T>()
            .AnyAsync(predicate);

        public IQueryable<T> GetAllQuery() => table.AsNoTracking().AsQueryable();


        public virtual async Task<T> GetByAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includeExpressions)
        {
            IQueryable<T> set = _dbContext.Set<T>();
            foreach (var includeExpression in includeExpressions)
            {
                set = set.Include(includeExpression);
            }
            T result = await set.FirstOrDefaultAsync(predicate);
            return result;
        }


        public async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includeExpressions)
        {
            IQueryable<T> set = _dbContext.Set<T>();
            foreach (var includeExpression in includeExpressions)
            {
                set = set.Include(includeExpression);
            }
            IReadOnlyList<T> results = await set.AsNoTracking().Where(predicate).ToListAsync();
            return results;
        }


        public async Task<int> CountAsync() => await _dbContext.Set<T>().CountAsync();



    }
}
