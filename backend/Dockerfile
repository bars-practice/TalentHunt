FROM mcr.microsoft.com/dotnet/sdk:10.0 AS publish
WORKDIR /src

COPY ["TalentHunt.slnx", "./"]
COPY ["TalentHunt.API/TalentHunt.API.csproj", "TalentHunt.API/"]
COPY ["TalentHunt.Application/TalentHunt.Application.csproj", "TalentHunt.Application/"]
COPY ["TalentHunt.Infrastructure/TalentHunt.Infrastructure.csproj", "TalentHunt.Infrastructure/"]

RUN dotnet restore "TalentHunt.slnx"

COPY . .

WORKDIR "/src/TalentHunt.API"
RUN dotnet publish "TalentHunt.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "TalentHunt.API.dll"]