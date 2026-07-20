using System;
using System.Collections.Generic;

namespace ControleGastos.DTOs
{
    // O resumo individual de cada pessoa na listagem
    public record ResumoPessoaDto(Guid Id, string Nome, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);

    // O relatório completo consolidando todas as pessoas e o total geral
    public record RelatorioGeralDto(
        List<ResumoPessoaDto> Pessoas, 
        decimal TotalGeralReceitas, 
        decimal TotalGeralDespesas, 
        decimal SaldoLiquidoGeral
    );
}