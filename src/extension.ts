// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { isNullOrUndefined, isNull, isUndefined } from 'util';

// required to be able to run commands, I think
const { exec } = require('child_process');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
// specifically package.json looks for a config.toml file in your workspace
// and activates this function if it finds it
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "turbohugo" is now active!');

	// grabs extension specific settings
	let configuration = vscode.workspace.getConfiguration('turbohugo');
	let defaultContent = configuration.get('defaultContent');				// isn't used for anything, but is designed to allow for an alternate content location
	let defaultSection = configuration.get('defaultSection');				// this is the "default" location for new posts
	let defaultArchetype = configuration.get('defaultArchetype');			// this allows for a "default" archetype to be specified, option
	let previewArguments = configuration.get('previewArguments');
	let buildArguments = configuration.get('buildArguments');
	let bindServer = configuration.get('bindServer');

	// returns the hugo version being used
	let getVersion = vscode.commands.registerCommand('turbohugo.version', () => {
		exec('hugo version', (err: string, stdout: string, stderr: string) => {
			if (stdout) {
				vscode.window.showInformationMessage(stdout);
			}
			if (stderr) {
				console.error('stderr:', stderr);
			}
			if (err) {
				vscode.window.showErrorMessage(err);
			}
		});
	});

	let newPost = vscode.commands.registerCommand('turbohugo.newpost', async () => {
		let section = await vscode.window.showInputBox({ placeHolder: 'Section', value: `${defaultSection}` });
		if (section === undefined) {return;}
		if (section === '') {
			section = `${defaultSection}`;
			vscode.window.showInformationMessage('Using default sectin \`' + defaultSection + '\`');
		}
		let filename = await vscode.window.showInputBox({ placeHolder: 'Enter filename', prompt: 'Can include sub-folder' });
		if (section === undefined) {return;}
		if (filename === '') {
			vscode.window.showWarningMessage('No filename specified, cancelling command.');
			return;
		}
		
		let postPath = section + '/' + filename;
		let execCommand = 'hugo new ' + postPath + ' -s ' + vscode.workspace.rootPath;
		exec(execCommand, (err: string, stdout: string, stderr: string) => {
			if (stdout) {
				vscode.window.showInformationMessage(stdout);
			}
			if (stderr) {
				vscode.window.showWarningMessage(stderr);
			}
			if (err) {
				vscode.window.showErrorMessage(err);
			}
		});
	});

	let newArchetype = vscode.commands.registerCommand('turbohugo.newarchetype', async () => {
		let archetype = await vscode.window.showInputBox({ placeHolder: 'Archetype/Bundle', value: `${defaultArchetype}` });
		if (archetype === undefined) {return;};
		if (archetype === '') {
			vscode.window.showWarningMessage('No archetype specified, try turboHugo: New Post instead.');
			return;
		}
		let section = await vscode.window.showInputBox({ placeHolder: 'Section', value: `${defaultSection}` });
		if (section === undefined) {return;}
		if (section === '') {
			section = `${defaultSection}`;
			vscode.window.showInformationMessage('Using default section \`' + defaultSection + '\`');
		}
		let filename = await vscode.window.showInputBox({ placeHolder: 'Enter filename', prompt: 'Can include sub-folder' });
		if (filename === undefined) {return;}
		if (filename === '') {
			vscode.window.showWarningMessage('No filename specified, cancelling command.');
			return;
		}

		let postPath = section + '/' + filename;
		let execCommand = 'hugo new --kind ' + archetype + ' ' + postPath + ' -s ' + vscode.workspace.rootPath;
		exec(execCommand, (err: string, stdout: string, stderr: string) => {
			if (stdout) {
				vscode.window.showInformationMessage(stdout);
			}
			if (stderr) {
				vscode.window.showWarningMessage(stderr);
			}
			if (err) {
				vscode.window.showErrorMessage(err);
			}
		});
	});

	// runs hugo server with preview options
	let buildPreview = vscode.commands.registerCommand('turbohugo.buildpreview', () => {
		let terminal = vscode.window.createTerminal({
			name: 'Hugo Server'
		});

		let execCommand = 'hugo server ' + previewArguments + ' -s ' + vscode.workspace.rootPath;
		terminal.sendText( execCommand );

		terminal.show;
		/*
		
		exec(execCommand, (err: string, stdout: string, stderr: string) => {
			if (stdout) {
				vscode.window.showInformationMessage(stdout);
			}
			if (stderr) {
				console.error('stderr:', stderr);
			}
			if (err) {
				vscode.window.showErrorMessage(err);
			}
		});
		*/
	});
/*
	let buildPreview = vscode.commands.registerCommand('turbohugo.buildpreview', () => {
		let terminal = vscode.window.createTerminal({
			name: 'Hugo Server'
		});

		let execCommand = 'hugo server ' + previewArguments + ' -s ' + vscode.workspace.rootPath;
		terminal.sendText( execCommand );

		terminal.show;
		/*
		
		exec(execCommand, (err: string, stdout: string, stderr: string) => {
			if (stdout) {
				vscode.window.showInformationMessage(stdout);
			}
			if (stderr) {
				console.error('stderr:', stderr);
			}
			if (err) {
				vscode.window.showErrorMessage(err);
			}
		});
		*/
	});

	context.subscriptions.push(getVersion);
	context.subscriptions.push(newPost);
	context.subscriptions.push(newArchetype);
	context.subscriptions.push(buildPreview);
}

// this method is called when your extension is deactivated
export function deactivate() {}


function selectTerminal(): Thenable<vscode.Terminal | undefined> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	});
	return vscode.window.showQuickPick(items).then(item => {
		return item ? item.terminal : undefined;
	});
}