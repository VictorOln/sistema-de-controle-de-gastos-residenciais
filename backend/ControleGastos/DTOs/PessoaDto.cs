using System;

namespace ControleGastos.DTOs
{
    // DTO para a criação de uma nova pessoa (o que vem do front-end)
    public record CriarPessoaDto(string Nome, int Idade);

    // DTO para listar/exibir os dados de uma pessoa de forma limpa
    public record ExibirPessoaDto(Guid Id, string Nome, int Idade);
}