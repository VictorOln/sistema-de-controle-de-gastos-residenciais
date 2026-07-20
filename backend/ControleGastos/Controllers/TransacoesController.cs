using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;
using ControleGastos.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ControleGastos.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Define a rota automática: /api/transacoes
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Injeção de dependência do contexto do banco de dados
        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. CADASTRO DE TRANSAÇÃO (COM VALIDAÇÃO DE IDADE)
        // POST: api/transacoes
        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] CriarTransacaoDto dto)
        {
            // Validações básicas dos campos da requisição
            if (string.IsNullOrWhiteSpace(dto.Descricao))
                return BadRequest("A descrição da transação é obrigatória.");

            if (dto.Valor <= 0)
                return BadRequest("O valor da transação deve ser maior que zero.");

            // REGRA DE NEGÓCIO: Esse valor precisa existir no cadastro de pessoa
            var pessoa = await _context.Pessoas.FindAsync(dto.PessoaId);
            if (pessoa == null)
                return BadRequest("A pessoa informada não existe no cadastro.");

            // REGRA DE NEGÓCIO: Se for menor de 18 anos, apenas despesas podem ser cadastradas
            if (pessoa.Idade < 18 && dto.Tipo != TipoTransacao.Despesa)
                return BadRequest($"A pessoa '{pessoa.Nome}' é menor de idade ({pessoa.Idade} anos) e só pode registrar despesas.");

            // Mapeia o DTO para a Entidade do banco de dados
            var transacao = new Transacao
            {
                Descricao = dto.Descricao,
                Valor = dto.Valor,
                Tipo = dto.Tipo,
                PessoaId = dto.PessoaId
            };

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync(); // Persiste no SQLite

            // RETORNO CORRIGIDO: Retornamos os dados limpos sem referências cíclicas
            return Ok(new
            {
                id = transacao.Id,
                descricao = transacao.Descricao,
                valor = transacao.Valor,
                tipo = transacao.Tipo.ToString(),
                pessoaId = transacao.PessoaId,
                pessoaNome = pessoa.Nome
            });
        }

        // 2. LISTAGEM DE TRANSAÇÕES
        // GET: api/transacoes
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            // Busca as transações incluindo os dados da pessoa vinculada (.Include)
            var transacoes = await _context.Transacoes
                .Include(t => t.Pessoa)
                .Select(t => new
                {
                    t.Id,
                    t.Descricao,
                    t.Valor,
                    Tipo = t.Tipo.ToString(),
                    PessoaId = t.PessoaId,
                    PessoaNome = t.Pessoa != null ? t.Pessoa.Nome : "Desconhecido"
                })
                .ToListAsync();

            return Ok(transacoes);
        }
    }
}