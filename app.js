
let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];

function atualizarInterface() {
    const lista = document.getElementById('lista-transacoes');
    lista.innerHTML = '';
    let receitas = 0;
    let despesas = 0;

    transacoes.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = `${t.descricao}: R$ ${t.valor.toFixed(2).replace('.', ',')} (${t.tipo})`;
        li.style.background = t.tipo === 'receita' ? '#d4f9d4' : '#f9d4d4';
        li.style.position = 'relative';

        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => excluirTransacao(t.id);
        li.appendChild(btn);
        lista.appendChild(li);

        if (t.tipo === 'receita') receitas += t.valor;
        else despesas += t.valor;
    });

    document.getElementById('total-receitas').textContent = receitas.toFixed(2).replace('.', ',');
    document.getElementById('total-despesas').textContent = despesas.toFixed(2).replace('.', ',');
    document.getElementById('saldo').textContent = (receitas - despesas).toFixed(2).replace('.', ',');

    atualizarGrafico(receitas, despesas);
    atualizarGraficoEvolucao();
}

function adicionarTransacao() {
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value.replace(',', '.'));
    const tipo = document.getElementById('tipo').value;

    if (!descricao || isNaN(valor)) return alert('Preencha todos os campos corretamente.');

    const data = new Date();
    const nova = {
        id: Date.now(),
        descricao,
        valor,
        tipo,
        mes: data.getMonth(),
        ano: data.getFullYear()
    };

    transacoes.push(nova);
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    atualizarInterface();

    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
}

function excluirTransacao(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    atualizarInterface();
}

let chartPizza, chartLinha, chartInvestimentos;

function atualizarGrafico(receitas, despesas) {
    const ctx = document.getElementById('grafico').getContext('2d');
    if (chartPizza) chartPizza.destroy();
    chartPizza = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                label: 'Total (R$)',
                data: [receitas, despesas],
                backgroundColor: ['#4caf50', '#f44336']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y'
        }
    });
}

function atualizarGraficoEvolucao() {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const receitasPorMes = new Array(12).fill(0);
    const despesasPorMes = new Array(12).fill(0);

    transacoes.forEach(t => {
        if (t.tipo === 'receita') receitasPorMes[t.mes] += t.valor;
        else despesasPorMes[t.mes] += t.valor;
    });

    if (chartLinha) chartLinha.destroy();
    chartLinha = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasPorMes,
                    borderColor: '#4caf50',
                    backgroundColor: '#4caf5044',
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: despesasPorMes,
                    borderColor: '#f44336',
                    backgroundColor: '#f4433644',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function adicionarInvestimento() {
    const tipo = document.getElementById('investimento-tipo').value;
    const valor = parseFloat(document.getElementById('investimento-valor').value.replace(',', '.'));
    const rendimento = parseFloat(document.getElementById('investimento-rendimento').value.replace(',', '.'));

    if (!tipo || isNaN(valor) || isNaN(rendimento)) return alert('Preencha os dados corretamente.');

    const novo = {
        id: Date.now(),
        tipo,
        valor,
        rendimento,
        valorAtual: valor + (valor * rendimento / 100)
    };

    investimentos.push(novo);
    localStorage.setItem('investimentos', JSON.stringify(investimentos));
    atualizarInvestimentos();

    document.getElementById('investimento-tipo').value = '';
    document.getElementById('investimento-valor').value = '';
    document.getElementById('investimento-rendimento').value = '';
}

function atualizarInvestimentos() {
    const lista = document.getElementById('lista-investimentos');
    lista.innerHTML = '';

    const dados = {};

    investimentos.forEach(inv => {
        if (!('rendimento' in inv)) inv.rendimento = 0;
        if (!('valorAtual' in inv)) inv.valorAtual = inv.valor + (inv.valor * inv.rendimento / 100);

        const li = document.createElement('li');
        li.innerHTML = `<strong>${inv.tipo}</strong>: R$ ${inv.valor.toFixed(2).replace('.', ',')} + ${inv.rendimento}% = <b>R$ ${inv.valorAtual.toFixed(2).replace('.', ',')}</b>`;

        const btn = document.createElement('button');
        btn.textContent = '🗑️';
        btn.onclick = () => excluirInvestimento(inv.id);
        li.appendChild(btn);
        lista.appendChild(li);

        dados[inv.tipo] = (dados[inv.tipo] || 0) + inv.valorAtual;
    });

    atualizarGraficoInvestimentos(dados);
    localStorage.setItem('investimentos', JSON.stringify(investimentos));
}

function excluirInvestimento(id) {
    investimentos = investimentos.filter(i => i.id !== id);
    localStorage.setItem('investimentos', JSON.stringify(investimentos));
    atualizarInvestimentos();
}

function atualizarGraficoInvestimentos(dados) {
    const ctx = document.getElementById('graficoInvestimentos').getContext('2d');
    if (chartInvestimentos) chartInvestimentos.destroy();
    chartInvestimentos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                label: 'Investimentos',
                data: Object.values(dados),
                backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#9c27b0', '#e91e63']
            }]
        },
        options: { responsive: true }
    });
}

function baixarBackup() {
    const dados = { transacoes, investimentos };
    const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "controle-financeiro-backup.json";
    link.click();
}

function importarBackup() {
    const arquivo = document.getElementById('arquivoBackup').files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.transacoes && dados.investimentos) {
                transacoes = dados.transacoes;
                investimentos = dados.investimentos;
                localStorage.setItem('transacoes', JSON.stringify(transacoes));
                localStorage.setItem('investimentos', JSON.stringify(investimentos));
                atualizarInterface();
                atualizarInvestimentos();
                alert("Backup restaurado com sucesso!");
            } else {
                alert("Arquivo de backup inválido.");
            }
        } catch {
            alert("Erro ao importar backup.");
        }
    };
    leitor.readAsText(arquivo);
}

setTimeout(() => {
    atualizarInterface();
    atualizarInvestimentos();
}, 100);
