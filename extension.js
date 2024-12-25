const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function activate(context) {
    console.log('Congratulations, your extension "auto-build" is now active!');

    const disposable = vscode.commands.registerCommand('auto-build.buildProject', async function () {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Откройте рабочую папку.');
            return;
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        const cmakeListsPath = path.join(workspacePath, 'CMakeLists.txt');
        const buildPath = path.join(workspacePath, 'build');

        
        if (!fs.existsSync(cmakeListsPath)) {
            vscode.window.showErrorMessage(`CMakeLists.txt не найден в папке: ${workspacePath}`);
            return;
        }

        try {
            await executeCommand('cmake --version');
        } catch {
            vscode.window.showErrorMessage('CMake не установлен. Установите CMake и добавьте его в PATH.');
            return;
        }

       
        if (!fs.existsSync(buildPath)) {
            try {
                await fs.promises.mkdir(buildPath);
                vscode.window.showInformationMessage('Папка build создана автоматически.');
            } catch (error) {
                vscode.window.showErrorMessage(`Ошибка при создании папки build: ${error.message}`);
                return;
            }
        }

        try {
            await executeCommand('cmake -G Ninja ..', { cwd: buildPath });

            
            await executeCommand('cmake --build .', { cwd: buildPath });

            
            const executableName = process.platform === 'win32' ? 'main.exe' : 'main';
            const mainExePath = path.join(buildPath, executableName);

            if (!fs.existsSync(mainExePath)) {
                vscode.window.showErrorMessage(`Исполняемый файл ${executableName} не найден. Проверьте конфигурацию сборки.`);
                return;
            }

           
            await executeCommand(`.${path.sep}${executableName}`, { cwd: buildPath });

            vscode.window.showInformationMessage('Проект собран и запущен!');
        } catch (error) {
            vscode.window.showErrorMessage(`Ошибка: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Ошибка выполнения команды "${command}": ${stderr || stdout || error.message}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};