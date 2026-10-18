let inputEditor, outputEditor;
const obfuscator = new LuaObfuscator();

// Inicializar Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    // Tema oscuro personalizado
    monaco.editor.defineTheme('neon', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: { 'editor.background': '#00000000' } // Fondo transparente para el efecto cristal
    });

    inputEditor = monaco.editor.create(document.getElementById('inputEditor'), {
        value: '-- Pega tu código Lua aquí\nprint("Hola Mundo")\n\nlocal function saludar(nombre)\n    print("Hola, " .. nombre)\nend\n\nsaludar("Usuario")',
        language: 'lua',
        theme: 'neon',
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'Consolas, monospace'
    });

    outputEditor = monaco.editor.create(document.getElementById('outputEditor'), {
        value: '',
        language: 'lua',
        theme: 'neon',
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'Consolas, monospace'
    });
});

// Botón de Ofuscar
document.getElementById('obfuscateBtn').addEventListener('click', () => {
    const btn = document.getElementById('obfuscateBtn');
    const level = parseInt(document.getElementById('obfuscationLevel').value);
    const code = inputEditor.getValue();

    if (!code.trim()) {
        alert("Por favor, ingresa un código Lua.");
        return;
    }

    btn.querySelector('.btn-text').innerText = "Procesando...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    setTimeout(() => {
        try {
            const result = obfuscator.obfuscate(code, level);
            outputEditor.setValue(result);
        } catch (error) {
            alert("Error al ofuscar: " + error.message);
        } finally {
            btn.querySelector('.btn-text').innerText = "⚡ Ofuscar Código";
            btn.style.opacity = "1";
            btn.disabled = false;
        }
    }, 800); // Pequeño delay para dar efecto de procesamiento
});

// Botón de Copiar
document.getElementById('copyBtn').addEventListener('click', () => {
    const text = outputEditor.getValue();
    if (text) {
        navigator.clipboard.writeText(text);
        const btn = document.getElementById('copyBtn');
        btn.innerText = "✅";
        setTimeout(() => btn.innerText = "📋", 2000);
    }
});
