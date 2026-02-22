// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SparqlFormatter } from './sparqlFormatter';

class SparqlDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
	private formatter = new SparqlFormatter();

	provideDocumentFormattingEdits(
		document: vscode.TextDocument,
		options: vscode.FormattingOptions,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.TextEdit[]> {
		if (token.isCancellationRequested) {
			return [];
		}

		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);

		// Set indent size from VS Code options
		this.formatter.setIndentSize(options.tabSize);

		const formattedText = this.formatter.format(document.getText());
		
		return [vscode.TextEdit.replace(fullRange, formattedText)];
	}
}

class SparqlDocumentRangeFormattingEditProvider implements vscode.DocumentRangeFormattingEditProvider {
	private formatter = new SparqlFormatter();

	provideDocumentRangeFormattingEdits(
		document: vscode.TextDocument,
		range: vscode.Range,
		options: vscode.FormattingOptions,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.TextEdit[]> {
		if (token.isCancellationRequested) {
			return [];
		}

		// Set indent size from VS Code options
		this.formatter.setIndentSize(options.tabSize);

		const selectedText = document.getText(range);
		const formattedText = this.formatter.format(selectedText);
		
		return [vscode.TextEdit.replace(range, formattedText)];
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('SPARQL Formatter extension is now active!');

	// Register formatting providers for SPARQL files
	const sparqlSelector: vscode.DocumentSelector = [
		{ language: 'sparql', scheme: 'file' },
		{ language: 'sparql', scheme: 'untitled' },
		{ pattern: '**/*.sparql' },
		{ pattern: '**/*.rq' }
	];

	// Register document formatting provider
	const documentFormattingProvider = vscode.languages.registerDocumentFormattingEditProvider(
		sparqlSelector,
		new SparqlDocumentFormattingEditProvider()
	);

	// Register document range formatting provider
	const rangeFormattingProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(
		sparqlSelector,
		new SparqlDocumentRangeFormattingEditProvider()
	);

	// Register format command
	const formatCommand = vscode.commands.registerCommand('sparql-formatter.format', () => {
		vscode.commands.executeCommand('editor.action.formatDocument');
	});

	// Register format selection command
	const formatSelectionCommand = vscode.commands.registerCommand('sparql-formatter.formatSelection', () => {
		vscode.commands.executeCommand('editor.action.formatSelection');
	});

	context.subscriptions.push(
		documentFormattingProvider,
		rangeFormattingProvider,
		formatCommand,
		formatSelectionCommand
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
