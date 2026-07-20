using System;

namespace ControleGastos.Models
{
    public class Transacao
    {
        // Identificador único gerado automaticamente
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public string Descricao { get; set; } = string.Empty;
        
        public decimal Valor { get; set; }
        
        // Usa o Enum que criamos acima (Receita ou Despesa)
        public TipoTransacao Tipo { get; set; }
        
        // --- RELACIONAMENTO ---
        // Aqui guardamos o ID da pessoa dona dessa transação (Chave Estrangeira)
        public Guid PessoaId { get; set; }
        
        // Propriedade de navegação: Permite ao Entity Framework buscar os dados 
        // da pessoa vinculada a essa transação de forma automática depois.
        public Pessoa? Pessoa { get; set; }
    }
}