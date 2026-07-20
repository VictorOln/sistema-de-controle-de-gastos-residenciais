using System;
using System.Collections.Generic;

namespace ControleGastos.Models
{
    public class Pessoa
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nome { get; set; } = string.Empty;
        public int Idade { get; set; }
        
        // NOVA LINHA: Uma pessoa pode ter uma coleção (lista) de várias transações
        public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}