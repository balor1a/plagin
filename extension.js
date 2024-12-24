const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');


function activate(context) {

	console.log('Congratulations, your extension "auto-build" is now active!');


	const disposable = vscode.commands.registerCommand('auto-build.buildProject', function () {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		const terminal = vscode.window.createTerminal('CMake build');
		terminal.show();

		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('Откройте рабочую папку build.');
			return;
		}

		const workspacePath = workspaceFolders[0].uri.fsPath;

		const cmakeListsPath = `${workspacePath}/CMakeLists.txt`;

		const buildPath = path.join(workspacePath, 'build');
        try {
            vscode.workspace.fs.stat(vscode.Uri.file(buildPath));
        } catch {
            vscode.window.showErrorMessage('Папка build создана автоматически.');
			terminal.sendText('mkdir build');
			terminal.sendText('cd build');
			terminal.sendText('cmake -G Ninja ..');
			terminal.sendText('cd ..');
        }


		try {
			vscode.workspace.fs.stat(vscode.Uri.file(cmakeListsPath));
		} catch {
			vscode.window.showErrorMessage('CMakeLists.txt не найдены. Проверьте что файлы существуют и названы корректно.');
			return;
		}

		
		terminal.sendText('cd build');
		terminal.sendText('cmake --build .');

		const mainExePath = path.join(buildPath, 'main.exe');
        try {
            vscode.workspace.fs.stat(vscode.Uri.file(mainExePath));
        } catch {
            vscode.window.showErrorMessage('main.exe не найден. Проверьте конфигурацию сборки и название исполняемого файла.');
            return;
        }

		terminal.sendText('.\\main.exe');
		terminal.sendText('cd ..');

		vscode.window.showInformationMessage('Проект собран и запущен!');
	});

	context.subscriptions.push(disposable);
}


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
