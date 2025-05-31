// camera-module.js
const CameraModule = (() => {
    // Elementos
    const elements = {
        startCameraBtn: document.getElementById('startCameraBtn'),
        captureBtn: document.getElementById('captureBtn'),
        retryCaptureBtn: document.getElementById('retryCaptureBtn'),
        addCaptureBtn: document.getElementById('addCaptureBtn'),
        cameraPreview: document.getElementById('cameraPreview'),
        capturedImage: document.getElementById('capturedImage'),
        cameraCanvas: document.getElementById('cameraCanvas'),
        studentName: document.getElementById('studentName')
    };
    
    // Estado
    let cameraStream = null;
    
    // Funções públicas
    const init = () => {
        setupEventListeners();
    };
    
    const setupEventListeners = () => {
        elements.startCameraBtn.addEventListener('click', startCamera);
        elements.captureBtn.addEventListener('click', captureImage);
        elements.retryCaptureBtn.addEventListener('click', retryCapture);
        elements.addCaptureBtn.addEventListener('click', addCaptureToList);
    };
    
    const startCamera = async () => {
        try {
            // Solicita acesso à câmera
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            elements.cameraPreview.srcObject = cameraStream;
            
            // Atualiza botões
            elements.startCameraBtn.disabled = true;
            elements.captureBtn.disabled = false;
            
            updateStatus('Câmera iniciada. Posicione o gabarito e clique em Capturar.');
        } catch (error) {
            console.error('Erro ao acessar a câmera:', error);
            updateStatus('Erro ao acessar a câmera. Verifique as permissões.', 'error');
        }
    };
    
    const captureImage = () => {
        // Configura o canvas com as mesmas dimensões do vídeo
        const video = elements.cameraPreview;
        elements.cameraCanvas.width = video.videoWidth;
        elements.cameraCanvas.height = video.videoHeight;
        
        // Desenha o frame atual no canvas
        const ctx = elements.cameraCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, elements.cameraCanvas.width, elements.cameraCanvas.height);
        
        // Converte canvas para imagem e exibe
        elements.capturedImage.src = elements.cameraCanvas.toDataURL('image/jpeg');
        elements.capturedImage.style.display = 'block';
        elements.cameraPreview.style.display = 'none';
        
        // Mostra os botões de controle
        elements.addCaptureBtn.disabled = false;
        elements.retryCaptureBtn.disabled = false;
        elements.captureBtn.disabled = true;
        
        updateStatus('Imagem capturada. Clique em "Adicionar" para incluir na lista.');
    };
    
    const retryCapture = () => {
        // Volta para modo de visualização da câmera
        elements.capturedImage.style.display = 'none';
        elements.cameraPreview.style.display = 'block';
        
        // Atualiza botões
        elements.addCaptureBtn.disabled = true;
        elements.retryCaptureBtn.disabled = true;
        elements.captureBtn.disabled = false;
    };
    
    const addCaptureToList = () => {
        // Obtém o nome do aluno
        const studentName = elements.studentName.value || `Aluno ${ProcessingModule.getFilesCount() + 1}`;
        
        // Converte o canvas para um blob
        elements.cameraCanvas.toBlob(blob => {
            // Cria um arquivo a partir do blob
            const fileName = `${studentName}_${new Date().toISOString().slice(0, 10)}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            // Adiciona à lista de arquivos
            ProcessingModule.addFile(file, studentName);
            
            // Atualiza a interface
            updateStatus(`Captura de "${studentName}" adicionada à lista.`);
            
            // Reinicia a câmera
            retryCapture();
            elements.studentName.value = '';
        }, 'image/jpeg', 0.9);
    };
    
    // Função auxiliar
    const updateStatus = (message, type = 'info') => {
        // Implementação simplificada
        document.getElementById('statusText').textContent = message;
    };
    
    // Retorna a API pública do módulo
    return {
        init,
        startCamera,
        captureImage,
        retryCapture,
        addCaptureToList
    };
})();