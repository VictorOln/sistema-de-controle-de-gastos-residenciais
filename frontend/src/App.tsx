import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { AxiosError } from 'axios';

// --- definicao da interface (TypeScript) ---
interface Pessoa {
  id: string;
  nome: string;
  idade: number;
}

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'Receita' | 'Despesa';
  pessoaNome: string;
}

interface ResumoPessoa {
  id: string;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface RelatorioGeral {
  pessoas: ResumoPessoa[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number;
}

export default function App() {
  // Controle de Abas
  const [abaAtiva, setAbaAtiva] = useState<'pessoas' | 'transacoes' | 'totais'>(
    'pessoas'
  );

  // Estados dos Dados
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioGeral | null>(null);

  // Estados dos Formulários
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'Receita' | 'Despesa'>('Despesa');
  const [pessoaId, setPessoaId] = useState('');

  // Mensagens de Feedback
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // --- SINCRO DE DADOS COM EF COMPLIANT (LINTER APPROVED) ---
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setErro('');
        const resPessoas = await api.get<Pessoa[]>('/pessoas');
        setPessoas(resPessoas.data);

        const resTransacoes = await api.get<Transacao[]>('/transacoes');
        setTransacoes(resTransacoes.data);

        const resTotais = await api.get<RelatorioGeral>('/pessoas/totais');
        setRelatorio(resTotais.data);
      } catch (err) {
        const axiosError = err as AxiosError<string>;
        setErro(
          axiosError.response?.data || 'Erro ao conectar com o servidor .NET'
        );
      }
    };

    carregarDados();
  }, [abaAtiva]);

  // Limpa mensagens temporárias de feedback
  useEffect(() => {
    if (!erro && !sucesso) return;

    const timer = setTimeout(() => {
      setErro('');
      setSucesso('');
    }, 5000);

    return () => clearTimeout(timer);
  }, [erro, sucesso]);

  // Auxiliar para recarregar dados manualmente após ações de formulário
  const forcarRecarregamento = async () => {
    try {
      const resPessoas = await api.get<Pessoa[]>('/pessoas');
      setPessoas(resPessoas.data);

      const resTransacoes = await api.get<Transacao[]>('/transacoes');
      setTransacoes(resTransacoes.data);

      const resTotais = await api.get<RelatorioGeral>('/pessoas/totais');
      setRelatorio(resTotais.data);
    } catch (err) {
      const axiosError = err as AxiosError<string>;
      setErro(axiosError.response?.data || 'Erro ao atualizar dados');
    }
  };

  // --- AÇÕES DO SISTEMA ---
  const cadastrarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !idade) return setErro('Preencha todos os campos!');

    try {
      await api.post('/pessoas', { nome, idade: Number(idade) });
      setSucesso('Pessoa cadastrada com sucesso!');
      setNome('');
      setIdade('');
      await forcarRecarregamento();
    } catch (err) {
      const axiosError = err as AxiosError<string>;
      setErro(axiosError.response?.data || 'Erro ao cadastrar pessoa');
    }
  };

  const deletarPessoa = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente deletar esta pessoa? Todas as transações associadas serão apagadas.'
      )
    )
      return;
    try {
      await api.delete(`/pessoas/${id}`);
      setSucesso('Pessoa e suas transações removidas com sucesso!');
      await forcarRecarregamento();
    } catch (err) {
      const axiosError = err as AxiosError<string>;
      setErro(axiosError.response?.data || 'Erro ao deletar pessoa');
    }
  };

  const cadastrarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !pessoaId)
      return setErro('Preencha todos os campos!');

    try {
      await api.post('/transacoes', {
        descricao,
        valor: Number(valor),
        tipo: tipo === 'Receita' ? 0 : 1,
        pessoaId,
      });
      setSucesso('Transação cadastrada com sucesso!');
      setDescricao('');
      setValor('');
      await forcarRecarregamento();
    } catch (err) {
      const axiosError = err as AxiosError<string>;
      setErro(axiosError.response?.data || 'Erro ao cadastrar transação');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] antialiased selection:bg-neutral-200">
      {/* Navbar Minimalista Totalmente Centralizada */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex flex-col items-center justify-center gap-2.5">
          <div className="flex items-center space-x-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/40">
            <button
              onClick={() => setAbaAtiva('pessoas')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${abaAtiva === 'pessoas' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Pessoas
            </button>
            <button
              onClick={() => setAbaAtiva('transacoes')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${abaAtiva === 'transacoes' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Transações
            </button>
            <button
              onClick={() => setAbaAtiva('totais')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${abaAtiva === 'totais' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Visão Geral
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo Centralizado */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Notificações Clean */}
        {erro && (
          <div className="mb-6 p-4 bg-red-50/60 border border-red-100 text-red-800 text-xs font-medium rounded-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{erro}</span>
          </div>
        )}
        {sucesso && (
          <div className="mb-6 p-4 bg-emerald-50/60 border border-emerald-100 text-emerald-800 text-xs font-medium rounded-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{sucesso}</span>
          </div>
        )}

        {/* --- ABA: GERENCIAR PESSOAS --- */}
        {abaAtiva === 'pessoas' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="mb-5">
                <h2 className="text-sm font-bold text-neutral-900">
                  Nova conta
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Adicione um novo membro familiar ao sistema.
                </p>
              </div>
              <form onSubmit={cadastrarPessoa} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Victor Oliveira"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 focus:bg-white text-xs transition-all placeholder:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    placeholder="Ex: 24"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 focus:bg-white text-xs transition-all placeholder:text-neutral-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Criar Cadastro
                </button>
              </form>
            </div>

            <div className="md:col-span-8 bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-sm font-bold text-neutral-900">
                  Membros ativos
                </h2>
              </div>
              {pessoas.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-neutral-400 text-xs">
                    Nenhum membro listado no momento.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <th className="px-6 py-3">Nome</th>
                        <th className="px-6 py-3">Faixa Etária</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {pessoas.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-neutral-50/30 transition-all"
                        >
                          <td className="px-6 py-4 font-medium text-neutral-900">
                            {p.nome}
                          </td>
                          <td className="px-6 py-4 text-neutral-500">
                            {p.idade} anos
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deletarPessoa(p.id)}
                              className="text-neutral-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50/40 cursor-pointer transition-all"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA: TRANSAÇÕES --- */}
        {abaAtiva === 'transacoes' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="mb-5">
                <h2 className="text-sm font-bold text-neutral-900">
                  Novo lançamento
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Movimente o fluxo do caixa residencial.
                </p>
              </div>
              <form onSubmit={cadastrarTransacao} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Responsável
                  </label>
                  <select
                    value={pessoaId}
                    onChange={(e) => setPessoaId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 focus:bg-white text-xs transition-all"
                  >
                    <option value="">Selecione...</option>
                    {pessoas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.idade}a)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Compra de mantimentos"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 focus:bg-white text-xs transition-all placeholder:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Quantia (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 focus:bg-white text-xs transition-all placeholder:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Natureza do fluxo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipo('Receita')}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${tipo === 'Receita' ? 'bg-neutral-950 border-neutral-950 text-white shadow-xs' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'}`}
                    >
                      Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('Despesa')}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${tipo === 'Despesa' ? 'bg-neutral-950 border-neutral-950 text-white shadow-xs' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'}`}
                    >
                      Despesa
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Efetivar Lançamento
                </button>
              </form>
            </div>

            <div className="md:col-span-8 bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-sm font-bold text-neutral-900">
                  Extrato de atividades
                </h2>
              </div>
              {transacoes.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-neutral-400 text-xs">
                    Nenhuma transação efetuada.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <th className="px-6 py-3">Descrição</th>
                        <th className="px-6 py-3">Membro</th>
                        <th className="px-6 py-3">Fluxo</th>
                        <th className="px-6 py-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {transacoes.map((t) => (
                        <tr
                          key={t.id}
                          className="hover:bg-neutral-50/30 transition-all"
                        >
                          <td className="px-6 py-4 font-medium text-neutral-900">
                            {t.descricao}
                          </td>
                          <td className="px-6 py-4 text-neutral-500">
                            {t.pessoaNome}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${t.tipo === 'Receita' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                            >
                              {t.tipo}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-medium tracking-tight ${t.tipo === 'Receita' ? 'text-emerald-600' : 'text-neutral-900'}`}
                          >
                            {t.tipo === 'Receita' ? '+' : '-'} R${' '}
                            {t.valor.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA: CONSULTA DE TOTAIS --- */}
        {abaAtiva === 'totais' && relatorio && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Balanço Consolidado Pro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Receitas Acumuladas
                </span>
                <span className="text-xl font-bold tracking-tight text-neutral-900">
                  R$ {relatorio.totalGeralReceitas.toFixed(2)}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Despesas Acumuladas
                </span>
                <span className="text-xl font-bold tracking-tight text-neutral-900">
                  R$ {relatorio.totalGeralDespesas.toFixed(2)}
                </span>
              </div>
              <div
                className={`p-6 rounded-2xl border shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] ${relatorio.saldoLiquidoGeral >= 0 ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-red-950 border-red-900 text-red-100'}`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${relatorio.saldoLiquidoGeral >= 0 ? 'text-neutral-400' : 'text-red-300'}`}
                >
                  Balanço Líquido Residencial
                </span>
                <span className="text-xl font-bold tracking-tight">
                  R$ {relatorio.saldoLiquidoGeral.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tabela de Rateio Individual */}
            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-sm font-bold text-neutral-900">
                  Balanço individualizado
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Membro</th>
                      <th className="px-6 py-3 text-emerald-700">Receitas</th>
                      <th className="px-6 py-3 text-red-700">Despesas</th>
                      <th className="px-6 py-3 text-right">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {relatorio.pessoas.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-neutral-50/30 transition-all"
                      >
                        <td className="px-6 py-4 font-medium text-neutral-900">
                          {p.nome}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-medium">
                          R$ {p.totalReceitas.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-red-500">
                          R$ {p.totalDespesas.toFixed(2)}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-semibold tracking-tight ${p.saldo >= 0 ? 'text-neutral-900' : 'text-red-600'}`}
                        >
                          R$ {p.saldo.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
