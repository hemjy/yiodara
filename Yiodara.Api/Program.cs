using FluentEmail.Smtp;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Net;
using System.Net.Mail;
using Yiodara.Application.Features.Auth.Commands;
using Yiodara.Domain.Entities;
using Yiodara.Infrastructure;
using Yiodara.Infrastructure.Persistence.Contexts;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();


// register mediator
builder.Services.AddMediatR(cfg => 
cfg.RegisterServicesFromAssemblies(new[] { typeof(Program).Assembly, typeof(SignUpUserCommand).Assembly}));


// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// get config
var config = builder.Configuration;

// Add services
builder.Services.AddInfrastructure(config, Log.Logger);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();


// seeding users.

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<User>>();
    var dbContext = services.GetRequiredService<ApplicationDbContext>();

    await SeedRolesAsync(roleManager);
    await SeedAdminUserAsync(userManager, roleManager);
    var categoryIds = await SeedCampaignCategoriesAsync(dbContext);
    await SeedCampaignsAsync(dbContext, categoryIds.Item1, categoryIds.Item2, categoryIds.Item3);
    await SeedPaymentTransactionsAsync(dbContext, userManager);
}



// Configure the HTTP request pipeline.
app.UseSerilogRequestLogging();


app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
app.UseHealthChecks("/health");
app.UseCors("AllowAll");
app.MapControllers();

app.Run();


// seed roles - donor, volunteer and admin
static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
{
    var roleNames = new[] { "Donor", "Volunteer", "Admin" };

    foreach (var roleName in roleNames)
    {
        var roleExist = await roleManager.RoleExistsAsync(roleName);
        if (!roleExist)
        {
            var role = new IdentityRole(roleName);
            await roleManager.CreateAsync(role);
        }
    }
}

// Seed an Admin user 
static async Task SeedAdminUserAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
{
    var adminUser = await userManager.FindByEmailAsync("admin@admin.com");

    if (adminUser == null)
    {
        var user = new User
        {
            UserName = "admin@admin.com",
            Email = "admin@admin.com",
            FullName = "admin"
        };

        var result = await userManager.CreateAsync(user, "Admin@123");

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, "Admin");
        }
    }

    // Regular user 1
    var user1 = await userManager.FindByEmailAsync("user1@example.com");
    if (user1 == null)
    {
        var newUser1 = new User
        {
            UserName = "james@example.com",
            Email = "user1@example.com",
            FullName = "James Justin"
        };
        var result = await userManager.CreateAsync(newUser1, "User1@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(newUser1, "Donor");
        }
    }

    // Regular user 2
    var user2 = await userManager.FindByEmailAsync("user2@example.com");
    if (user2 == null)
    {
        var newUser2 = new User
        {
            UserName = "user2@example.com",
            Email = "user2@example.com",
            FullName = "Janet John"
        };
        var result = await userManager.CreateAsync(newUser2, "User2@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(newUser2, "Donor");
        }
    }


    // volunteer 1
    var user3 = await userManager.FindByEmailAsync("user3@example.com");
    if (user3 == null)
    {
        var newUser3 = new User
        {
            UserName = "user3@example.com",
            Email = "user3@example.com",
            FullName = "volunteer1"
        };
        var result = await userManager.CreateAsync(newUser3, "Volun1@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(newUser3, "Volunteer");
        }
    }

    // volunteer 2
    var user4 = await userManager.FindByEmailAsync("user4@example.com");
    if (user4 == null)
    {
        var newUser4 = new User
        {
            UserName = "user4@example.com",
            Email = "user4@example.com",
            FullName = "volunteer2"
        };
        var result = await userManager.CreateAsync(newUser4, "Volun2@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(newUser4, "Volunteer");
        }
    }

    var user5 = await userManager.FindByEmailAsync("user5@example.com");
    if (user5 == null)
    {
        var newUser5 = new User
        {
            UserName = "user5@example.com",
            Email = "user5@example.com",
            FullName = "Ra Ag"
        };
        var result = await userManager.CreateAsync(newUser5, "User2@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(newUser5, "Donor");
        }
    }
}

// Seed Campaign Categories - returns IDs to be used by campaign seeder
static async Task<Tuple<Guid, Guid, Guid>> SeedCampaignCategoriesAsync(ApplicationDbContext dbContext)
{
    // Check if any campaign categories exist
    if (!await dbContext.CampaignCategories.AnyAsync())
    {
        // Create campaign categories
        var educationCategory = CampaignCategory.Create("Education");
        var healthcareCategory = CampaignCategory.Create("Healthcare");
        var environmentCategory = CampaignCategory.Create("Environment");

        await dbContext.CampaignCategories.AddRangeAsync(educationCategory, healthcareCategory, environmentCategory);
        await dbContext.SaveChangesAsync();

        return Tuple.Create(educationCategory.Id, healthcareCategory.Id, environmentCategory.Id);
    }
    else
    {
        // Get existing category IDs
        var categories = await dbContext.CampaignCategories.Take(3).ToListAsync();

        // Ensure we have at least 3 categories
        if (categories.Count < 3)
        {
            var existingNames = categories.Select(c => c.Name.ToLower()).ToList();

            if (!existingNames.Contains("education"))
            {
                var educationCategory = CampaignCategory.Create("Education");
                await dbContext.CampaignCategories.AddAsync(educationCategory);
                categories.Add(educationCategory);
            }

            if (!existingNames.Contains("healthcare"))
            {
                var healthcareCategory = CampaignCategory.Create("Healthcare");
                await dbContext.CampaignCategories.AddAsync(healthcareCategory);
                categories.Add(healthcareCategory);
            }

            if (!existingNames.Contains("environment"))
            {
                var environmentCategory = CampaignCategory.Create("Environment");
                await dbContext.CampaignCategories.AddAsync(environmentCategory);
                categories.Add(environmentCategory);
            }

            await dbContext.SaveChangesAsync();
        }

        return Tuple.Create(categories[0].Id, categories[1].Id, categories[2].Id);
    }
}

static async Task SeedCampaignsAsync(
    ApplicationDbContext dbContext,
    Guid educationCategoryId,
    Guid healthcareCategoryId,
    Guid environmentCategoryId)
{
    // Check if any campaigns exist
    if (!await dbContext.Campaigns.AnyAsync())
    {
        var campaigns = new List<Campaign>
        {
            // Education campaign
            Campaign.Create(
                title: "School Building Project",
                description: "Help us build a new school in a rural community to provide quality education to children who currently have limited access to educational facilities.",
                campaignCategoryId: educationCategoryId,
                currency: "USD",
                amount: 50000.00,
                coverImage: "https://cdn.pixabay.com/photo/2023/01/30/15/36/school-7755985_1280.jpg",
                otherImages: new List<string> {
                    "https://www.pixelstalk.net/wp-content/uploads/2016/11/Education-Wallpapers-HD.jpg",
                    "https://www.pixelstalk.net/wp-content/uploads/2016/11/Education-Wallpapers-HD.jpg"
                }
            ),
            
            // Healthcare campaign
            Campaign.Create(
                title: "Medical Equipment Drive",
                description: "Our local hospital needs modern medical equipment to better serve our community. Your donations will help purchase vital life-saving equipment.",
                campaignCategoryId: healthcareCategoryId,
                currency: "USD",
                amount: 75000.00,
                coverImage: "https://media.istockphoto.com/id/2152985078/photo/senior-couple-medical-appointment.jpg?s=1024x1024&w=is&k=20&c=NwS0_w_n59_J0oA2iZaZ6m1mxsHHJaavC_RgUjS3yOY=",
                otherImages: new List<string> {
                    "https://media.istockphoto.com/id/1903424167/photo/medical-team-meeting.jpg?s=1024x1024&w=is&k=20&c=znrbrcmjni7-e7Ysphowp-dp89GiNuj-wKjNq6pwZJk=",
                    "https://img.freepik.com/free-photo/books-stethoscope_1150-18056.jpg?t=st=1744537903~exp=1744541503~hmac=b5e60dbd820373d5e5439ba1fec6e6126cd8a83b9605de3871a87244b95d4384&w=1380"
                }
            ),
            
            // Environment campaign
            Campaign.Create(
                title: "Reforestation Initiative",
                description: "Help us plant 10,000 trees to restore forests destroyed by wildfires and contribute to combating climate change in our region.",
                campaignCategoryId: environmentCategoryId,
                currency: "USD",
                amount: 35000.00,
                coverImage: "https://media.istockphoto.com/id/1939499353/photo/creating-art-for-a-sustainable-future.jpg?s=1024x1024&w=is&k=20&c=Y9CVeSsD0nY5rowdN2BQUdO1ZbtMv-mKapKkm_KBb_o=",
                otherImages: new List<string> {
                    "https://plus.unsplash.com/premium_photo-1681140560898-bc854a3b8b1c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
            )
        };

        await dbContext.Campaigns.AddRangeAsync(campaigns);
        await dbContext.SaveChangesAsync();
    }
}

static async Task SeedPaymentTransactionsAsync(ApplicationDbContext dbContext, UserManager<User> userManager)
{
    // Check if any payment transactions exist
    if (!await dbContext.PaymentTransactions.AnyAsync())
    {
        // Get the users
        var admin = await userManager.FindByEmailAsync("admin@admin.com");
        var user1 = await userManager.FindByEmailAsync("user1@example.com");
        var user2 = await userManager.FindByEmailAsync("user2@example.com");

        // Get the campaigns
        var campaigns = await dbContext.Campaigns.Take(3).ToListAsync();
        if (campaigns.Count < 3)
        {
            // Not enough campaigns seeded
            return;
        }

        var educationCampaign = campaigns[0];
        var healthcareCampaign = campaigns[1];
        var environmentCampaign = campaigns[2];

        // Create payment transactions
        var transactions = new List<PaymentTransaction>
        {
            // Admin's transactions (3)
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 500.00m,
                Currency = "USD",
                DollarValue = 500.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":500,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"123456\"}",
                Date = DateTime.UtcNow.AddDays(-15),
                UserId = admin.Id,
                CampaignId = educationCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 1000.00m,
                Currency = "USD",
                DollarValue = 1000.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":1000,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"234567\"}",
                Date = DateTime.UtcNow.AddDays(-12),
                UserId = admin.Id,
                CampaignId = healthcareCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 750.00m,
                Currency = "USD",
                DollarValue = 750.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":750,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"345678\"}",
                Date = DateTime.UtcNow.AddDays(-10),
                UserId = admin.Id,
                CampaignId = environmentCampaign.Id
            },
            
            // User1's transactions (3)
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 250.00m,
                Currency = "USD",
                DollarValue = 250.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":250,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"456789\"}",
                Date = DateTime.UtcNow.AddDays(-8),
                UserId = user1.Id,
                CampaignId = educationCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 300.00m,
                Currency = "EUR",
                DollarValue = 330.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":300,\"currency\":\"EUR\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"567890\"}",
                Date = DateTime.UtcNow.AddDays(-7),
                UserId = user1.Id,
                CampaignId = healthcareCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 200.00m,
                Currency = "USD",
                DollarValue = 200.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":200,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"678901\"}",
                Date = DateTime.UtcNow.AddDays(-5),
                UserId = user1.Id,
                CampaignId = environmentCampaign.Id
            },
            
            // User2's transactions (4)
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 100.00m,
                Currency = "USD",
                DollarValue = 100.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":100,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"789012\"}",
                Date = DateTime.UtcNow.AddDays(-9),
                UserId = user2.Id,
                CampaignId = educationCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 1500.00m,
                Currency = "GBP",
                DollarValue = 1950.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":1500,\"currency\":\"GBP\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"890123\"}",
                Date = DateTime.UtcNow.AddDays(-4),
                UserId = user2.Id,
                CampaignId = healthcareCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 450.00m,
                Currency = "USD",
                DollarValue = 450.00m,
                Status = "paid",
                ProviderRequest = "{\"amount\":450,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"success\",\"transactionId\":\"901234\"}",
                Date = DateTime.UtcNow.AddDays(-3),
                UserId = user2.Id,
                CampaignId = environmentCampaign.Id
            },
            new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                ReferenceNo = "TX-" + Guid.NewGuid().ToString().Substring(0, 8),
                Amount = 800.00m,
                Currency = "USD",
                DollarValue = 800.00m,
                Status = "pending",
                ProviderRequest = "{\"amount\":800,\"currency\":\"USD\"}",
                ProviderResponse = "{\"status\":\"pending\",\"transactionId\":\"112233\"}",
                Date = DateTime.UtcNow.AddDays(-1),
                UserId = user2.Id,
                CampaignId = healthcareCampaign.Id
            }
        };

        await dbContext.PaymentTransactions.AddRangeAsync(transactions);
        await dbContext.SaveChangesAsync();
    }
}