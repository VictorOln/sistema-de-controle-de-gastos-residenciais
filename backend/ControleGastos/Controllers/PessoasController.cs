using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;
using ControleGastos.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ControleGastos.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Define a rota automática: /api/pessoas
    public class PessoasController : ControllerBase
    {
        private readonly AppDbContext _context;

        // O construtor recebe o nosso contexto do banco de dados (Injeção de Dependência)
        public PessoasController(AppDbContext context)
        {
            _context = context;
        }

        // 1. CADASTRO DE PESSOA
        // POST: api/pessoas
        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] CriarPessoaDto dto)
        {
            // Validações básicas de entrada
            if (string.IsNullOrWhiteSpace(dto.Nome))
                return BadRequest("O nome da pessoa é obrigatório.");

            if (dto.Idade < 0)
                return BadRequest("A idade não pode ser negativa.");

            // Converte o DTO recebido para a Entidade do banco de dados
            var pessoa = new Pessoa 
            { 
                Nome = dto.Nome, 
                Idade = dto.Idade 
            };

            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync(); // Salva no SQLite

            // Retorna o status 201 Created com os dados gerados
            return CreatedAtAction(nameof(Listar), new { id = pessoa.Id }, new ExibirPessoaDto(pessoa.Id, pessoa.Nome, pessoa.Idade));
        }

        // 2. LISTAGEM DE PESSOAS
        // GET: api/pessoas
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            // Busca todas as pessoas e transforma diretamente no formato do DTO de exibição
            var pessoas = await _context.Pessoas
                .Select(p => new ExibirPessoaDto(p.Id, p.Nome, p.Idade))
                .ToListAsync();

            return Ok(pessoas);
        }

        // 3. DELEÇÃO DE PESSOA (COM DELEÇÃO EM CASCATA)
        // DELETE: api/pessoas/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(Guid id)
        {
            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null)
                return NotFound("Pessoa não encontrada.");

            // Como configuramos o Cascade Delete no AppDbContext, o Entity Framework
            // remove automaticamente todas as transações associadas a este PessoaId no banco.
            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            return NoContent(); // Retorna 204 
        }

        // 4. CONSULTA DE TOTAIS
        // GET: api/pessoas/totais
        [HttpGet("totais")]
        public async Task<IActionResult> ObterTotais()
        {
            // Busca as pessoas incluindo a coleção de transações de cada uma (.Include)
            var pessoasComTransacoes = await _context.Pessoas
                .Include(p => p.Transacoes)
                .ToListAsync();

            // Calcula os totais individuais mapeando para o ResumoPessoaDto
            var resumoPessoas = pessoasComTransacoes.Select(p => {
                var receitas = p.Transacoes.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor);
                var despesas = p.Transacoes.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor);
                var saldo = receitas - despesas;

                return new ResumoPessoaDto(p.Id, p.Nome, receitas, despesas, saldo);
            }).ToList();

            // Calcula os totais gerais somando os resultados obtidos acima
            var totalGeralReceitas = resumoPessoas.Sum(r => r.TotalReceitas);
            var totalGeralDespesas = resumoPessoas.Sum(r => r.TotalDespesas);
            var saldoLiquidoGeral = totalGeralReceitas - totalGeralDespesas;

            // Monta o relatório final exigido pela especificação
            var relatorio = new RelatorioGeralDto(
                resumoPessoas, 
                totalGeralReceitas, 
                totalGeralDespesas, 
                saldoLiquidoGeral
            );

            return Ok(relatorio);
        }
    }
}