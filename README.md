# TalentHunt

## Локальная настройка

Создайте или измените файл

backend/TalentHunt.API/appsettings.Development.json

со следующим содержимым:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=TalentHunt;Username=postgres;Password=ВАШ_ПАРОЛЬ"
  }
}
```