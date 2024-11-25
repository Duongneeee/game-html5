const { obfuscate } = require("javascript-obfuscator");
const fs = require('fs');

function Encryption(data) {
    // Đường dẫn tới file chứa mã nguồn JavaScript cho vào loader của app.tsx
    const filePath = data.input;
    const outputFilePath = data.output;

    // Đọc nội dung của file
    const codejs = fs.readFileSync(filePath, 'utf8');

    // Thực hiện obfuscate với mã JavaScript được đọc từ file
    const firstObfuscatedCode = obfuscate(codejs, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        stringArray: true,
        stringArrayThreshold: 0.75,
        identifierNamesGenerator: "hexadecimal",
    });

    const secondObfuscationResult = obfuscate(firstObfuscatedCode.getObfuscatedCode(), {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        stringArray: true,
        stringArrayThreshold: 0.75,
        identifierNamesGenerator: 'hexadecimal',
    });

    fs.writeFileSync(outputFilePath, secondObfuscationResult.getObfuscatedCode(), 'utf8');
}

const filesEncryption = [
    {
        input: 'D:/code/game-html5/crossy-road-game/script.js',
        output: 'D:/code/game-html5/crossy-road-game/script_encryption.js'
    },
    {
        input: 'D:/code/game-html5/flappy-bird/main.js',
        output: 'D:/code/game-html5/flappy-bird/main_encryption.js'
    },
    {
        input: 'D:/code/game-html5/stick-hero/main.js',
        output: 'D:/code/game-html5/stick-hero/main_encryption.js'
    },
    {
        input: 'D:/code/game-html5/tower-blocks/script.js',
        output: 'D:/code/game-html5/tower-blocks/script_encryption.js'
    }
];

(function(){
    filesEncryption.map((item)=>Encryption(item));
})()