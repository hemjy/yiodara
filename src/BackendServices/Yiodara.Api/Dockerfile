#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Yiodara.Api/Yiodara.Api.csproj", "Yiodara.Api/"]
COPY ["Yiodara.Application/Yiodara.Application.csproj", "Yiodara.Application/"]
COPY ["Yiodara.Domain/Yiodara.Domain.csproj", "Yiodara.Domain/"]
COPY ["Yiodara.Infrastructure/Yiodara.Infrastructure.csproj", "Yiodara.Infrastructure/"]
RUN dotnet restore "./Yiodara.Api/Yiodara.Api.csproj"
COPY . .
WORKDIR "/src/BackendServices/Yiodara.Api"
RUN dotnet build "./Yiodara.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Yiodara.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Yiodara.Api.dll"]