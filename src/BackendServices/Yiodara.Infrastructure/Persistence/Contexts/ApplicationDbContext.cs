using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Yiodara.Domain.Entities;

namespace Yiodara.Infrastructure.Persistence.Contexts
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }

        public DbSet<Partner> Partners { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public DbSet<CampaignCategory> CampaignCategories { get; set; }

        public DbSet<Campaign> Campaigns { get; set; }

        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }

        public DbSet<Event> Events { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<EventVolunteers> EventVolunteers { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<EntityBase>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.Created = DateTime.UtcNow;
                        break;
                    case EntityState.Modified:
                        entry.Entity.LastModified = DateTime.UtcNow;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Campaign>()
                .HasOne(c => c.CampaignCategory)
                .WithMany(cc => cc.Campaigns)
                .HasForeignKey(c => c.CampaignCategoryId);

            modelBuilder.Entity<EventVolunteers>(entity =>
            {
                // Configure the relationship with Event
                entity.HasOne(ev => ev.Event)
                      .WithMany(e => e.EventVolunteers)
                      .HasForeignKey(ev => ev.EventId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure the relationship with User (Volunteer)
                entity.HasOne(ev => ev.Volunteer)
                      .WithMany(u => u.EventVolunteers)
                      .HasForeignKey(ev => ev.VolunteerId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Create composite index for performance
                entity.HasIndex(ev => new { ev.EventId, ev.VolunteerId })
                      .IsUnique()
                      .HasDatabaseName("IX_EventVolunteers_EventId_VolunteerId");

                // Index for common queries
                entity.HasIndex(ev => ev.EventId)
                      .HasDatabaseName("IX_EventVolunteers_EventId");

                entity.HasIndex(ev => ev.VolunteerId)
                      .HasDatabaseName("IX_EventVolunteers_VolunteerId");
            });

        }
    }
}
