using Microsoft.EntityFrameworkCore;
using ControleGastos.Models;

namespace ControleGastos.Data
{
    // O DbContext é a classe base do Entity Framework para trabalhar com o banco
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Mapeando as nossas classes para virarem tabelas no banco de dados
        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<Transacao> Transacoes { get; set; }

        // Método onde configuramos regras de relacionamento
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // REGRA DE NEGÓCIO DO TESTE: Deleção em Cascata
            // Avisamos ao banco que, se uma pessoa for deletada, as transações vão junto.
            modelBuilder.Entity<Transacao>()
                .HasOne(t => t.Pessoa) // A transação tem UMA pessoa
                .WithMany(p => p.Transacoes) // A pessoa tem MUITAS transações
                .HasForeignKey(t => t.PessoaId) // A chave que liga as duas é o PessoaId
                .OnDelete(DeleteBehavior.Cascade); // Aplica a deleção em cascata
        }
    }
}