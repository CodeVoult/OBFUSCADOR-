class LuaObfuscator {
    constructor() {
        this.charPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    generateRandomString(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += this.charPool.charAt(Math.floor(Math.random() * this.charPool.length));
        }
        return result;
    }

    // Encripta un string usando XOR y lo pasa a Base64
    encryptString(str) {
        const key = Math.floor(Math.random() * 255) + 1;
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            encrypted += String.fromCharCode(str.charCodeAt(i) ^ key);
        }
        // Simulamos Base64 para Lua
        return { data: btoa(encrypted), key: key };
    }

    obfuscate(code, level) {
        let obfuscated = code;
        let stringDecoders = [];

        // 1. Encriptación de Strings (Nivel 2 y 3)
        if (level >= 2) {
            obfuscated = obfuscated.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
                // Ignorar si es muy corto o es un require
                if (match.length < 3) return match;
                let rawStr = match.substring(1, match.length - 1);
                let enc = this.encryptString(rawStr);
                
                let funcName = `_0x${this.generateRandomString(6)}`;
                stringDecoders.push({ name: funcName, data: enc.data, key: enc.key });
                
                return `${funcName}()`;
            });
        }

        // 2. Renombrado de variables y Control de Flujo (Nivel 3)
        if (level === 3) {
            // Renombrar variables locales
            let varMap = {};
            obfuscated = obfuscated.replace(/\blocal\s+([a-zA-Z_]\w*)/g, (match, varName) => {
                if (varName.includes('_0x')) return match;
                if (!varMap[varName]) {
                    varMap[varName] = `_0x${this.generateRandomString(8)}`;
                }
                return `local ${varMap[varName]}`;
            });
            
            // Reemplazar usos de variables
            for (let key in varMap) {
                let regex = new RegExp(`\\b${key}\\b`, 'g');
                obfuscated = obfuscated.replace(regex, varMap[key]);
            }
        }

        // 3. Construir el Runtime de Desencriptación en Lua
        let runtime = `-- Protected by NEO Obfuscator\n`;
        runtime += `local function _0xDecode(b64, key)\n`;
        runtime += `    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\n`;
        runtime += `    local str = b64:gsub('[^'..b..'=]', '')\n`;
        runtime += `    return (str:gsub('.', function(x)\n`;
        runtime += `        if (x == '=') then return '' end\n`;
        runtime += `        local r,f='',(b:find(x)-1)\n`;
        runtime += `        for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end\n`;
        runtime += `        return r;\n`;
        runtime += `    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)\n`;
        runtime += `        if (#x ~= 8) then return '' end\n`;
        runtime += `        local c=0\n`;
        runtime += `        for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end\n`;
        runtime += `        return string.char(bit32.bxor(c, key))\n`;
        runtime += `    end))\n`;
        runtime += `end\n\n`;

        // Añadir las funciones decodificadoras específicas
        stringDecoders.forEach(decoder => {
            runtime += `local function ${decoder.name}()\n`;
            runtime += `    return _0xDecode("${decoder.data}", ${decoder.key})\n`;
            runtime += `end\n`;
        });

        return runtime + "\n" + obfuscated;
    }
}
