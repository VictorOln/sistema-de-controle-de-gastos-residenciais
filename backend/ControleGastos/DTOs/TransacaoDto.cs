using System;
using ControleGastos.Models;

namespace ControleGastos.DTOs
{
    // DTO para receber os dados de uma nova transação do front-end
    public record CriarTransacaoDto(string Descricao, decimal Valor, TipoTransacao Tipo, Guid PessoaId);
}