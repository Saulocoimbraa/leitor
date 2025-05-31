// results-module.js
const ResultsModule = (() => {
    // Elementos
    const elements = {
        resultsTable: document.getElementById('resultsTable'),
        resultsBody: document.getElementById('resultsBody'),
        exportBtn: document.getElementById('exportBtn'),
        answerKey: document.getElementById('answerKey'),
        numQuestions: document.getElementById('numQuestions')
    };
    
    // Funções públicas
    const init = () => {
        setupEventListeners();
    };
    
    const setupEventListeners = () => {
        elements.exportBtn.addEventListener('click', exportToCSV);
    };
    
    const updateResultsTable = () => {
        // Limpa resultados anteriores
        elements.resultsBody.innerHTML = '';
        
        // Obtém dados do módulo de processamento
        const results = ProcessingModule.results;
        const files = ProcessingModule.files;
        
        // Obtém o gabarito oficial
        const answerKey = elements.answerKey.value.trim();
        const officialAnswers = answerKey ? answerKey.split(',').map(a => a.trim().toUpperCase()) : [];
        
        // Cria cabeçalho
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Aluno</th>';
        
        const numQuestions = parseInt(elements.numQuestions.value);
        for (let i = 1; i <= numQuestions; i++) {
            headerRow.innerHTML += `<th>Q${i}</th>`;
        }
        headerRow.innerHTML += '<th>Acertos</th>';
        
        elements.resultsTable.querySelector('thead').innerHTML = '';
        elements.resultsTable.querySelector('thead').appendChild(headerRow);
        
        // Adiciona gabarito oficial como primeira linha
        if (officialAnswers.length > 0) {
            const officialRow = document.createElement('tr');
            officialRow.style.backgroundColor = '#e3f2fd';
            officialRow.innerHTML = `<td><strong>GABARITO OFICIAL</strong></td>`;
            
            for (let i = 0; i < numQuestions; i++) {
                const answer = i < officialAnswers.length ? officialAnswers[i] : '?';
                officialRow.innerHTML += `<td><strong>${answer}</strong></td>`;
            }
            officialRow.innerHTML += `<td><strong>${numQuestions}</strong></td>`;
            
            elements.resultsBody.appendChild(officialRow);
        }
        
        // Adiciona resultados dos alunos
        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${result.student}</td>`;
            
            // Calcula acertos comparando com gabarito oficial
            let correctCount = 0;
            for (let i = 0; i < numQuestions; i++) {
                const answer = i < result.answers.length ? result.answers[i] : '?';
                const isCorrect = officialAnswers.length > i && answer === officialAnswers[i];
                
                if (isCorrect) correctCount++;
                
                // Destaca respostas corretas/incorretas
                const cell = document.createElement('td');
                cell.textContent = answer;
                
                if (officialAnswers.length > 0) {
                    if (isCorrect) {
                        cell.classList.add('correct');
                    } else {
                        cell.classList.add('incorrect');
                    }
                }
                
                row.appendChild(cell);
            }
            
            // Adiciona célula de acertos
            const scoreCell = document.createElement('td');
            scoreCell.innerHTML = `<strong>${correctCount}/${numQuestions}</strong>`;
            row.appendChild(scoreCell);
            
            elements.resultsBody.appendChild(row);
        });
    };
    
    const exportToCSV = () => {
        const results = ProcessingModule.results;
        
        if (results.length === 0) {
            updateStatus('Nenhum resultado para exportar', 'error');
            return;
        }
        
        // Obtém o gabarito oficial
        const answerKey = elements.answerKey.value.trim();
        const officialAnswers = answerKey ? answerKey.split(',').map(a => a.trim().toUpperCase()) : [];
        
        let csv = 'Aluno;';
        
        // Cabeçalho
        const numQuestions = parseInt(elements.numQuestions.value);
        for (let i = 1; i <= numQuestions; i++) {
            csv += `Q${i};`;
        }
        csv += 'Acertos;\n';
        
        // Linha do gabarito oficial
        if (officialAnswers.length > 0) {
            csv += 'GABARITO OFICIAL;';
            for (let i = 0; i < numQuestions; i++) {
                csv += `${i < officialAnswers.length ? officialAnswers[i] : '?'};`;
            }
            csv += `${numQuestions};\n`;
        }
        
        // Dados dos alunos
        results.forEach(result => {
            csv += `"${result.student}";`;
            
            let correctCount = 0;
            for (let i = 0; i < numQuestions; i++) {
                const answer = i < result.answers.length ? result.answers[i] : '?';
                const isCorrect = officialAnswers.length > i && answer === officialAnswers[i];
                
                if (isCorrect) correctCount++;
                csv += `${answer};`;
            }
            
            csv += `${correctCount};\n`;
        });
        
        // Cria e faz download do arquivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'resultados_gabaritos.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        updateStatus('Planilha exportada com sucesso!', 'success');
    };
    
    // Função auxiliar
    const updateStatus = (message, type = 'info') => {
        document.getElementById('statusText').textContent = message;
    };
    
    // Retorna a API pública do módulo
    return {
        init,
        updateResultsTable
    };
})();