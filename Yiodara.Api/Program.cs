using Microsoft.AspNetCore.Identity;
using Serilog;
using Yiodara.Application.Features.Auth.Commands;
using Yiodara.Domain.Entities;
using Yiodara.Infrastructure;


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
    
var app = builder.Build();


// seeding users.

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<User>>();

    await SeedRolesAsync(roleManager);
    await SeedAdminUserAsync(userManager, roleManager);
}



// Configure the HTTP request pipeline.
app.UseSerilogRequestLogging();


app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
app.UseHealthChecks("/health");
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
}