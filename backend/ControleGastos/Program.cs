using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURAR O CORS (Adicione este bloco antes do builder.Build())
builder.Services.AddCors(options =>
{
    options.AddPolicy("Livre", policy =>
    {
        policy.AllowAnyOrigin()   // Permite requisições de qualquer origem (inclusive do React)
              .AllowAnyMethod()   // Permite GET, POST, DELETE, etc.
              .AllowAnyHeader();  // Permite qualquer cabeçalho na requisição
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 2. ATIVAR O CORS (Adicione esta linha antes do MapControllers)
app.UseCors("Livre");

app.MapControllers();

app.Run();