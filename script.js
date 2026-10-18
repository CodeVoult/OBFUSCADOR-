document.getElementById('obfuscateBtn').addEventListener('click', function() {
    const inputCode = document.getElementById('inputCode').value;
    const outputArea = document.getElementById('outputCode');
    const btn = document.getElementById('obfuscateBtn');

    if (!inputCode.trim()) {
        alert("Bro, pega un código Lua primero xd");
        return;
    }

    // Efecto visual en el botón
    btn.innerText = "Ofuscando...";
    btn.disabled = true;

    setTimeout(() => {
        try {
            let obfuscated = obfuscateLua(inputCode);
            outputArea.value = obfuscated;
        } catch (e) {
            alert("Error al ofuscar: " + e.message);
        } finally {
            btn.innerText = "+ Ofuscar Código";
            btn.disabled = false;
        }
    }, 500); // Pequeño delay para que se vea el "proceso"
});

function obfuscateLua(code) {
    // 1. Preparamos el runtime de desencriptación para el script final
    // Este pedazo de código irá al principio del script ofuscado
    const decoderFunction = `
local function _0xDecode(str)
    return (str:gsub('.', function (c)
        return string.char(tonumber(c, 16))
    end))
end
`;

    // 2. Encriptar Strings (Textos entre comillas)
    let encryptedCode = code.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, function(match) {
        // Quitamos las comillas
        let str = match.substring(1, match.length - 1);
        // Pasamos a Hexadecimal
        let hex = str.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        // Retornamos la llamada a la función de desencriptación
        return `_0xDecode("${hex}")`;
    });

    // 3. Renombrar Variables (Básico)
    // Busca "local nombre = ..." y lo cambia por "_0x" + número aleatorio
    let varCounter = 0;
    let varMap = {};
    encryptedCode = encryptedCode.replace(/\blocal\s+([a-zA-Z_]\w*)/g, function(match, varName) {
        if (varName === '_0xDecode') return match; // No tocar nuestra función
        if (!varMap[varName]) {
            varMap[varName] = `_0x${Math.random().toString(16).substr(2, 6)}`;
            varCounter++;
        }
        return `local ${varMap[varName]}`;
    });

    // Reemplazar los usos de las variables en el resto del código
    for (let original in varMap) {
        let regex = new RegExp('\\b' + original + '\\b', 'g');
        encryptedCode = encryptedCode.replace(regex, varMap[original]);
    }

    // 4. Unir todo y añadir una firma
    return `-- Obfuscated by Panda Key System\n${decoderFunction}\n${encryptedCode}`;
}
