const startButton = document.getElementById('startButton');
const mainContent = document.getElementById('mainContent');
const appDescription = document.getElementById('appDescription');
const switchContainer = document.getElementById('switchContainer');
const cipherOption = document.getElementById('cipherOption');
const decipherOption = document.getElementById('decipherOption');
const cipherContent = document.getElementById('cipherContent');
const decipherContent = document.getElementById('decipherContent');
const fileInput = document.getElementById('fileInput');
const inputTextArea = document.getElementById('inputTextArea');
const outputTextArea = document.getElementById('outputTextArea');
const cipherLength = document.getElementById('cipherLength');
const cipherButton = document.getElementById('cipherButton');
const saveButton = document.getElementById('saveButton');
const asciiTable = document.getElementById('asciiTable');
const cipheredFileInput = document.getElementById('cipheredFileInput');
const asciiFileInput = document.getElementById('asciiFileInput');
const decipherButton = document.getElementById('decipherButton');
const decipheredTextArea = document.getElementById('decipheredTextArea');
const loadingScreen = document.querySelector('.loading');
const toggleOption = document.getElementById('toggleOption');
const cipheredFileName = document.getElementById('cipheredFileName');
const asciiFileName = document.getElementById('asciiFileName');

let cipheredText = '';
let asciiTableContent = '';

function showLoading() {
  loadingScreen.style.display = 'flex';
}

function hideLoading() {
  loadingScreen.style.display = 'none';
}

startButton.addEventListener('click', function() {
  startButton.style.display = 'none';
  appDescription.style.display = 'none'; // Ocultar el párrafo al iniciar
  mainContent.classList.remove('hidden');
  switchContainer.classList.remove('hidden');
});

toggleOption.addEventListener('change', function() {
  if (toggleOption.checked) {
    cipherContent.classList.remove('active');
    decipherContent.classList.add('active');
  } else {
    decipherContent.classList.remove('active');
    cipherContent.classList.add('active');
  }
});

fileInput.addEventListener('change', async function(e) {
  const file = e.target.files[0];
  
  if (!file || (file.type !== 'text/plain' && file.type !== 'application/pdf')) {
    alert('Por favor, sube un archivo .txt o .pdf');
    e.target.value = ''; // Limpiar el input
    return;
  }

  if (file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = function(e) {
      inputTextArea.value = e.target.result;
    };
    reader.readAsText(file);
  } else if (file.type === 'application/pdf') {
    try {
      const pdfData = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const textArray = [];

      for (let i = 0; i < pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i + 1);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        textArray.push(pageText);
      }

      inputTextArea.value = textArray.join('\n');
    } catch (error) {
      console.error('Error al procesar el archivo PDF:', error);
      alert('Hubo un problema al leer el archivo PDF. Inténtalo de nuevo.');
    }
  }
});





cipheredFileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file.type !== 'text/plain') {
    alert('Por favor, sube un archivo .txt');
    e.target.value = ''; // Limpiar el input
  } else {
    cipheredFileName.textContent = `Archivo seleccionado: ${file.name}`;
  }
});

asciiFileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file.type !== 'text/plain') {
    alert('Por favor, sube un archivo .txt');
    e.target.value = ''; // Limpiar el input
  } else {
    asciiFileName.textContent = `Archivo seleccionado: ${file.name}`;
  }
});

function generateASCIITable(length, usedChars) {
  asciiTable.innerHTML = '';
  asciiTableContent = `CipherLength,${length}\nOriginal,Cifrado\n`; // Guardar el cipherLength en la primera línea
  const headerRow = asciiTable.insertRow();
  headerRow.insertCell().textContent = 'Original';
  headerRow.insertCell().textContent = 'Cifrado';

  for (let i = 0; i < 256; i++) {
    const originalChar = String.fromCharCode(i);
    if (usedChars.has(originalChar)) {
      let cipheredSegment = '';

      // Genera la secuencia cifrada para cada carácter original
      for (let j = 0; j < length; j++) {
        const shiftedCode = (i + j) % 256; // Desplazamiento y envoltura dentro del rango ASCII
        cipheredSegment += String.fromCharCode(shiftedCode);
      }

      const row = asciiTable.insertRow();
      row.insertCell().textContent = originalChar;
      row.insertCell().textContent = cipheredSegment;

      asciiTableContent += `${originalChar},${cipheredSegment}\n`;
    }
  }
}



function cipherText(text, length) {
  let result = '';
  const usedChars = new Set();
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    let cipheredSegment = '';
    
    // Convertir charCode en una secuencia de caracteres ASCII
    for (let j = 0; j < length; j++) {
      const shiftedCode = (charCode + j) % 256; // Desplazamiento y envoltura dentro del rango ASCII
      cipheredSegment += String.fromCharCode(shiftedCode);
    }
    
    result += cipheredSegment;
    usedChars.add(text[i]);
  }
  
  return { cipheredText: result, usedChars };
}



cipherButton.addEventListener('click', function() {
  showLoading();
  setTimeout(() => {
    const length = parseInt(cipherLength.value);
    const text = inputTextArea.value;
    const { cipheredText: result, usedChars } = cipherText(text, length);
    cipheredText = result;
    outputTextArea.value = cipheredText;
    generateASCIITable(length, usedChars);
    hideLoading();
  }, 500);
});

saveButton.addEventListener('click', function() {
  showLoading();
  setTimeout(() => {
    const length = cipherLength.value;
    
    // Guardar archivo cifrado
    const cipheredBlob = new Blob([cipheredText], { type: 'text/plain' });
    const cipheredLink = document.createElement('a');
    cipheredLink.href = URL.createObjectURL(cipheredBlob);
    cipheredLink.download = `DOFM${length}.txt`;
    cipheredLink.click();

    // Guardar archivo ASCII
    const asciiBlob = new Blob([asciiTableContent], { type: 'text/plain' });
    const asciiLink = document.createElement('a');
    asciiLink.href = URL.createObjectURL(asciiBlob);
    asciiLink.download = `DOFM${length}_ascii.txt`;
    asciiLink.click();

    hideLoading();
  }, 500);
});

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

decipherButton.addEventListener('click', async function() {
  const cipheredFile = cipheredFileInput.files[0];
  const asciiFile = asciiFileInput.files[0];

  if (!cipheredFile || !asciiFile) {
    alert('Por favor, seleccione ambos archivos.');
    return;
  }

  showLoading();
  try {
    const cipheredText = await readFile(cipheredFile);
    const asciiContent = await readFile(asciiFile);

    const lines = asciiContent.split('\n');
    const lengthLine = lines.shift(); // Extraer la primera línea que contiene el cipherLength
    const [_, length] = lengthLine.split(','); // Leer el cipherLength desde la primera línea

    const asciiMap = new Map();
    for (let i = 1; i < lines.length; i++) {
      const [original, ciphered] = lines[i].split(',');
      if (original && ciphered) {
        asciiMap.set(ciphered.trim(), original);
      }
    }

    let decipheredText = '';
    for (let i = 0; i < cipheredText.length; i += parseInt(length)) {
      const segment = cipheredText.slice(i, i + parseInt(length));
      const originalChar = asciiMap.get(segment) || ' ';
      decipheredText += originalChar;
    }

    decipheredTextArea.value = decipheredText;

    // Limpiar los textos de "archivo seleccionado"
    cipheredFileName.textContent = '';
    asciiFileName.textContent = '';

  } catch (error) {
    console.error('Error al leer los archivos:', error);
    alert('Hubo un error al leer los archivos. Por favor, inténtelo de nuevo.');
  } finally {
    hideLoading();
  }
});






// Nuevas gamas de colores más diversos y elegantes
const defaultTheme = document.getElementById('defaultTheme');
const darkTheme = document.getElementById('darkTheme');
const lightTheme = document.getElementById('lightTheme');
const natureTheme = document.getElementById('natureTheme');
const oceanTheme = document.getElementById('oceanTheme');
const sunsetTheme = document.getElementById('sunsetTheme');

function setTheme(theme) {
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--background-color', theme.background);
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.documentElement.style.setProperty('--container-bg', theme.containerBg);
  document.documentElement.style.setProperty('--accent-color', theme.accent);
  document.documentElement.style.setProperty('--button-color', theme.button);
  document.documentElement.style.setProperty('--button-hover-color', theme.buttonHover);
}

defaultTheme.addEventListener('click', () => setTheme({
  primary: '#37474F',       // Azul grisáceo oscuro
  secondary: '#78909C',     // Azul grisáceo claro
  background: '#ECEFF1',    // Gris muy claro
  text: '#263238',          // Azul oscuro
  containerBg: '#FFFFFF',   // Blanco puro
  accent: '#FFAB00',        // Amarillo dorado como acento
  button: '#FFAB00',        // Amarillo dorado
  buttonHover: '#FF6F00',   // Naranja oscuro
}));

darkTheme.addEventListener('click', () => setTheme({
  primary: '#212121',       // Negro profundo
  secondary: '#424242',     // Gris oscuro
  background: '#121212',    // Negro intenso
  text: '#E0E0E0',          // Gris muy claro
  containerBg: '#1E1E1E',   // Negro grisáceo
  accent: '#D32F2F',        // Rojo oscuro como acento
  button: '#D32F2F',        // Rojo oscuro
  buttonHover: '#B71C1C',   // Rojo intenso
}));

lightTheme.addEventListener('click', () => setTheme({
  primary: '#90A4AE',       // Azul claro grisáceo
  secondary: '#CFD8DC',     // Gris azuláceo claro
  background: '#F5F5F5',    // Gris claro
  text: '#37474F',          // Azul grisáceo oscuro
  containerBg: '#FFFFFF',   // Blanco puro
  accent: '#FF7043',        // Naranja suave como acento
  button: '#FF7043',        // Naranja suave
  buttonHover: '#FF5722',   // Naranja intenso
}));

natureTheme.addEventListener('click', () => setTheme({
  primary: '#2E7D32',       // Verde bosque
  secondary: '#66BB6A',     // Verde esmeralda
  background: '#E8F5E9',    // Verde pálido muy claro
  text: '#1B5E20',          // Verde muy oscuro
  containerBg: '#C8E6C9',   // Verde pálido
  accent: '#FFC107',        // Amarillo como acento
  button: '#FFC107',        // Amarillo
  buttonHover: '#FFB300',   // Amarillo oscuro
}));

oceanTheme.addEventListener('click', () => setTheme({
  primary: '#01579B',       // Azul profundo
  secondary: '#0288D1',     // Azul claro
  background: '#E1F5FE',    // Azul muy claro
  text: '#013D68',          // Azul marino muy oscuro
  containerBg: '#B3E5FC',   // Azul pálido
  accent: '#FF4081',        // Rosa fuerte como acento
  button: '#FF4081',        // Rosa fuerte
  buttonHover: '#F50057',   // Rosa oscuro
}));

sunsetTheme.addEventListener('click', () => setTheme({
  primary: '#D84315',       // Naranja profundo
  secondary: '#FF7043',     // Naranja suave
  background: '#FBE9E7',    // Rosa muy claro
  text: '#BF360C',          // Naranja muy oscuro
  containerBg: '#FFCCBC',   // Naranja pálido
  accent: '#FF6D00',        // Naranja intenso como acento
  button: '#FF6D00',        // Naranja intenso
  buttonHover: '#E65100',   // Naranja quemado
}));

// Set default theme on load
setTheme({
  primary: '#37474F',       // Azul grisáceo oscuro
  secondary: '#78909C',     // Azul grisáceo claro
  background: '#ECEFF1',    // Gris muy claro
  text: '#263238',          // Azul oscuro
  containerBg: '#FFFFFF',   // Blanco puro
  accent: '#FFAB00',        // Amarillo dorado como acento
  button: '#FFAB00',        // Amarillo dorado
  buttonHover: '#FF6F00',   // Naranja oscuro
});