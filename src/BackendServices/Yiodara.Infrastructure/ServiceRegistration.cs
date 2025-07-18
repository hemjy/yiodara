﻿using FluentEmail.Smtp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Stripe;
using System.Net;
using System.Net.Mail;
using System.Text;
using Yiodara.Application.Interfaces;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Email;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;
using Yiodara.Infrastructure.Email;
using Yiodara.Infrastructure.ExtensionMethods;
using Yiodara.Infrastructure.ExternalServices;
using Yiodara.Infrastructure.Identity;
using Yiodara.Infrastructure.Persistence.Contexts;
using Yiodara.Infrastructure.Persistence.Repositories;

namespace Yiodara.Infrastructure
{
    public static class ServiceRegistration
    {
        public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration, ILogger logger)
        {
            //services.AddDbContext<ApplicationDbContext>(options =>
            //            options.UseNpgsql(configuration["DefaultConnection"] ?? ""));
           

            services.AddDbContext<ApplicationDbContext>(options =>

                        options.UseNpgsql(configuration["DefaultConnection"] ?? ""));
            Console.WriteLine($"DefaultConnection: {configuration["DefaultConnection"]}");

            services.AddIdentity<User, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true; 
                options.Password.RequiredLength = 8;
                options.Password.RequiredUniqueChars = 1;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            // Add Identity services

            // Configure JWT Authentication
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:SecretKey"])),
                    ValidIssuer = configuration["JwtSettings:Issuer"],
                    ValidAudience = configuration["JwtSettings:Audience"],
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true, // This automatically checks the token expiration
                    ClockSkew = TimeSpan.Zero,  // Optional: Set clock skew (default is 5 minutes)
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var token = context.Request.Headers["Authorization"].ToString();
                        Console.WriteLine($"JWT Token received: {token}");
                        logger.Error("JWT Token received: {token}", token);
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception is SecurityTokenExpiredException)
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            context.Response.ContentType = "application/json";
                            logger.Error("Authentication failed: {Message}", context.Exception.Message);
                            return context.Response.WriteAsync("{\"error\":\"Token has expired\"}");
                        }

                        if (context.Exception is SecurityTokenException)
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            context.Response.ContentType = "application/json";
                            return context.Response.WriteAsync("{\"error\":\"Invalid token\"}");
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            // register swagger.
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Yiodara", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme."
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                           {
                               new OpenApiSecurityScheme
                               {
                                   Reference = new OpenApiReference
                                   {
                                       Type = ReferenceType.SecurityScheme,
                                       Id = "Bearer"
                                   },
                                    Scheme = "oauth2",
                                    Name = "Bearer",
                                    In = ParameterLocation.Header,
                               },
                               new string[] { }
                           }
                       });

            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            });

            // register serilog
            services.AddSingleton(Log.Logger);

            services.AddMemoryCache();
            services.AddHttpContextAccessor();
            services.AddHttpClient();

            // configure email config to get settings from appsettings.
            services.Configure<EmailConfiguration>(configuration.GetSection("SmtpSettings"));

            // Configure Stripe
            StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];

            // register dependency injection
           
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped(typeof(IGenericRepositoryAsync<>), typeof(GenericRepositoryAsync<>));
            services.AddScoped<ICloudinaryService, CloudinaryService.CloudinaryService>();
            services.AddScoped<ICurrencyCountryMappingService, CurrencyCountryMappingService>();
            services.AddScoped<IUtilityService, UtilityService>();
            services.AddSingleton(configuration);
            services.AddScoped<IEmailService, EmailService>();

        }
    }
}
