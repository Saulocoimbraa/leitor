// processing-module.js
const ProcessingModule = (() => {
    // Estado
    let files = [];
    let results = [];
    let processing = false;
    let processingCancelled = false;
    let currentProcessing = null;
    let processingQueue = [];
    
    // Elementos
    const elements = {
        processBtn: document.getElementById('processBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        cancelOverlayBtn: document.getElementById('cancelOverlayBtn'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        currentFile: document.getElementById('currentFile'),
        fileCounter: document.getElementById('fileCounter'),
        totalFiles: document.getElementById('totalFiles'),
        fileQueue: document.getElementById('fileQueue'),
        numQuestions: document.getElementById('numQuestions'),
        numOptions: document.getElementById('numOptions'),
        progressBar: document.getElementById('progressBar'),
        progressText: document.getElementById('progressText')
    };
    
    // Funções públicas
    const init = () => {
        setupEventListeners();
    };
    
    const getFilesCount = () => files.length;
    
    const addFile = (file, student) => {
        files.push({
            name: file.name,
            file: file,
            processed: false,
            student: student
        });
        updateFileQueue();
    };
    
    const setupEventListeners = () => {
        elements.processBtn.addEventListener('click', processFiles);
        elements.cancelBtn.addEventListener('click', cancelProcessing);
        elements.cancelOverlayBtn.addEventListener('click', cancelProcessing);
    };
    
    const processFiles = () => {
        if (files.length === 0) {
            updateStatus('Nenhum gabarito para processar', 'error');
            return;
        }
        
        if (processing) {
            updateStatus('Processamento já em andamento', 'warning');
            return;
        }
        
        processing = true;
        processingCancelled = false;
        results = [];
        processingQueue = [...files];
        elements.cancelBtn.style.display = 'block';
        
        // Mostra overlay de carregamento
        elements.loadingOverlay.style.display = 'flex';
        elements.totalFiles.textContent = files.length;
        elements.fileCounter.textContent = '0';
        
        // Processa o primeiro arquivo
        processNextFile();
    };
    
    const processNextFile = () => {
        if (processingCancelled || processingQueue.length === 0) {
            // Processamento concluído ou cancelado
            finishProcessing();
            return;
        }
        
        const file = processingQueue.shift();
        const fileIndex = files.findIndex(f => f.name === file.name);
        currentProcessing = fileIndex;
        
        elements.currentFile.textContent = file.student;
        elements.fileCounter.textContent = files.length - processingQueue.length - 1;
        updateFileQueue();
        
        updateStatus(`Processando: ${file.student}`, 'processing');
        updateProgress(((files.length - processingQueue.length - 1) / files.length) * 100);
        
        // Processamento otimizado com Web Workers (simulado)
        optimizeProcessing(file, fileIndex)
            .then(() => {
                if (!processingCancelled) {
                    // Processa próximo arquivo após um pequeno delay
                    setTimeout(processNextFile, 100);
                }
            })
            .catch(error => {
                console.error('Erro no processamento:', error);
                updateStatus(`Erro ao processar ${file.student}: ${error.message}`, 'error');
                processingCancelled = true;
                finishProcessing();
            });
    };
    
    const optimizeProcessing = (file, fileIndex) => {
        return new Promise((resolve) => {
            // Técnica de processamento não-bloqueante
            const chunkedProcessing = () => {
                const startTime = performance.now();
                let processed = 0;
                
                // Processa em pequenos chunks
                const processChunk = () => {
                    const chunkSize = 5; // Processa 5 itens por chunk
                    
                    for (let i = 0; i < chunkSize; i++) {
                        if (processed >= 100) {
                            resolve();
                            return;
                        }
                        
                        processed++;
                    }
                    
                    // Libera a thread para a UI
                    if (performance.now() - startTime < 50) {
                        setTimeout(processChunk, 0);
                    } else {
                        requestIdleCallback(processChunk);
                    }
                };
                
                processChunk();
            };
            
            // Simula processamento rápido
            setTimeout(() => {
    // Simulação de OCR - substituído pelo real
    extractAnswersWithOCR(file.file).then(detectedAnswers => {
        results.push({
            fileName: file.name,
            student: file.student,
            answers: detectedAnswers
        });

        files[fileIndex].processed = true;
        resolve();
        }).catch(error => {
        console.error("Erro de OCR:", error);
        resolve(); // ainda assim resolve para não travar a fila
        });
       }, 300);
                
                // Armazena resultados
                results.push({
                    fileName: file.name,
                    student: file.student,
                    answers: detectedAnswers
                });
                
                // Atualiza estado
                files[fileIndex].processed = true;
                
                resolve();
            }, 300); // Simula processamento rápido de 300ms
        });
    };
    
    const finishProcessing = () => {
        processing = false;
        elements.loadingOverlay.style.display = 'none';
        elements.cancelBtn.style.display = 'none';
        
        if (processingCancelled) {
            updateStatus('Processamento cancelado pelo usuário', 'warning');
        } else {
            updateStatus('Todos os gabaritos processados com sucesso!', 'success');
        }
        
        ResultsModule.updateResultsTable();
        updateFileQueue();
    };
    
    const cancelProcessing = () => {
        processingCancelled = true;
        updateStatus('Cancelando processamento...', 'warning');
    };
    
    const updateFileQueue = () => {
        elements.fileQueue.innerHTML = '';
        
        if (files.length === 0) {
            elements.fileQueue.innerHTML = '<p>Nenhum gabarito na fila de processamento</p>';
            return;
        }
        
        files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            
            const statusClass = file.processed ? 
                'queue-completed' : 
                (currentProcessing === index ? 'queue-processing' : 'queue-pending');
            
            item.innerHTML = `
                <div class="queue-name">${file.student}</div>
                <div class="queue-status ${statusClass}">
                    ${file.processed ? 'Processado' : (currentProcessing === index ? 'Processando...' : 'Na fila')}
                </div>
            `;
            
            elements.fileQueue.appendChild(item);
        });
    };
    
    const updateStatus = (message, type = 'info') => {
        document.getElementById('statusText').textContent = message;

const extractAnswersWithOCR = async (file) => {
    const imageURL = URL.createObjectURL(file);
    const { data: { text } } = await Tesseract.recognize(imageURL, 'eng', {
        logger: m => console.log(m)
    });

    // Suponha que as respostas estejam em formato como "1:A 2:C 3:B ..."
    const answers = [];
    const regex = /\d+[:\-]?\s*([A-E])/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
        answers.push(match[1].toUpperCase());
    }

    URL.revokeObjectURL(imageURL);

    // Preenche com '?' se tiver menos respostas do que o esperado
    const expected = parseInt(elements.numQuestions.value);
    while (answers.length < expected) answers.push('?');

    return answers.slice(0, expected);
};

    };
    
    const updateProgress = (percent) => {
        elements.progressBar.style.width = `${percent}%`;
        elements.progressText.textContent = `${Math.round(percent)}%`;
    };
    
    // Retorna a API pública do módulo
    return {
        init,
        addFile,
        getFilesCount,
        files,
        results
    };
})();
