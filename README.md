# SPARQL Formatter

A VS Code extension for formatting and beautifying SPARQL queries with intelligent indentation and syntax organization.

## Features

- **Document Formatting**: Format entire SPARQL documents with `Shift+Alt+F`
- **Selection Formatting**: Format selected SPARQL code blocks
- **Smart Indentation**: Automatically indent nested queries, OPTIONAL blocks, and UNION clauses
- **Keyword Organization**: Properly format and align SPARQL keywords (SELECT, WHERE, FILTER, etc.)
- **Triple Pattern Formatting**: Clean up triple patterns with consistent spacing
- **Prefix Management**: Organize PREFIX declarations at the top of queries

## Usage

### Format Entire Document
1. Open a SPARQL file (`.sparql` or `.rq`)
2. Press `Shift+Alt+F` or use Command Palette: "Format Document"
3. The entire query will be formatted

### Format Selection
1. Select the SPARQL code you want to format
2. Right-click and choose "Format SPARQL Selection"
3. Or use Command Palette: "Format SPARQL Selection"

### Context Menu
- Right-click in any SPARQL file to access formatting options
- Commands are available only when editing SPARQL files

## Supported File Types

- `.sparql` - SPARQL query files
- `.rq` - SPARQL query files (RDF Query)

## Commands

| Command | Description | Keybinding |
|---------|-------------|------------|
| `sparql-formatter.format` | Format SPARQL Document | `Shift+Alt+F` |
| `sparql-formatter.formatSelection` | Format SPARQL Selection | - |

## Example

**Before:**
```sparql
PREFIX foaf:<http://xmlns.com/foaf/0.1/> SELECT ?person ?name WHERE{?person a foaf:Person;foaf:name ?name.FILTER(?name != "").}
```

**After:**
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name
WHERE {
  ?person a foaf:Person ;
    foaf:name ?name .
  FILTER (?name != "")
}
```

## Development

### Building
```bash
npm install
npm run compile
```

### Testing
```bash
npm run watch  # Start TypeScript compiler in watch mode
F5             # Launch Extension Development Host
```

## Requirements

- VS Code 1.108.1 or higher

## Extension Settings

This extension uses VS Code's built-in formatting settings:
- `editor.tabSize` - Controls indentation size (default: 2)
- `editor.formatOnSave` - Auto-format on save
- `editor.formatOnPaste` - Auto-format on paste

## Known Issues

- Complex nested subqueries may need manual adjustment
- Some advanced SPARQL 1.1 constructs might not format perfectly

## Release Notes

### 0.0.1

Initial release of SPARQL Formatter:
- Basic SPARQL query formatting
- Document and selection formatting
- Keyword organization and indentation
- Support for common SPARQL constructs

---

**Enjoy formatting your SPARQL queries!**

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
