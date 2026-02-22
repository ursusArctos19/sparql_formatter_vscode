export class SparqlFormatter {
    private indentSize = 2;

    private isInsideQuotes(text: string, position: number): boolean {
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let i = 0;
        
        while (i < position && i < text.length) {
            const char = text[i];
            const prevChar = i > 0 ? text[i - 1] : '';
            
            // Skip escaped quotes
            if (prevChar === '\\') {
                i++;
                continue;
            }
            
            if (char === '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
            } else if (char === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
            }
            i++;
        }
        
        return inSingleQuote || inDoubleQuote;
    }

    format(sparqlQuery: string): string {
        let formatted = sparqlQuery.trim();
        
        // Remove extra whitespace and normalize line breaks
        formatted = formatted.replace(/\s+/g, ' ').replace(/\r?\n/g, '\n');
        
        // Add line breaks and indentation for SPARQL keywords
        formatted = this.addLineBreaksForKeywords(formatted);
        formatted = this.formatPrefixes(formatted);
        formatted = this.addSpacingAfterPrefixes(formatted);
        formatted = this.formatSelectClause(formatted);
        formatted = this.formatWhereClause(formatted);
        formatted = this.formatTriples(formatted);
        formatted = this.formatFilters(formatted);
        formatted = this.formatOptional(formatted);
        formatted = this.formatUnion(formatted);
        formatted = this.formatSubqueries(formatted);
        formatted = this.applyIndentation(formatted);
        
        // Clean up extra blank lines
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        
        return formatted;
    }

    private addLineBreaksForKeywords(query: string): string {
        const keywords = [
            'PREFIX', 'SELECT', 'DISTINCT', 'CONSTRUCT', 'ASK', 'DESCRIBE',
            'FROM', 'FROM NAMED', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
            'LIMIT', 'OFFSET', 'OPTIONAL', 'UNION', 'FILTER', 'BIND',
            'SERVICE', 'GRAPH', 'MINUS'
        ];

        let result = query;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            result = result.replace(regex, (match, offset) => {
                return this.isInsideQuotes(query, offset) ? match : `\n${keyword}`;
            });
        });

        return result;
    }

    private formatPrefixes(query: string): string {
        // Format PREFIX declarations to ensure proper spacing: PREFIX name: <URL>
        return query.replace(/PREFIX\s+(\w*)\s*:\s*(<[^>]+>)/gi, (match, name, url, offset) => {
            return this.isInsideQuotes(query, offset) ? match : `PREFIX ${name}: ${url}`;
        });
    }

    private addSpacingAfterPrefixes(query: string): string {
        // Add empty line after the last PREFIX declaration
        return query.replace(/(PREFIX\s+\w*:\s*<[^>]+>)\s*(?=\n(?!PREFIX))/gi, '$1\n');
    }

    private formatSelectClause(query: string): string {
        // Handle SELECT followed by DISTINCT on separate lines
        let result = query.replace(
            /(SELECT)\s*\n\s*(DISTINCT)\s+(.*?)(?=\nFROM|\nWHERE|\n\{|\n|$)/gi,
            (match, selectKeyword, distinctKeyword, variables, offset) => {
                if (this.isInsideQuotes(query, offset)) {
                    return match;
                }
                
                // Find the current indentation level of SELECT
                const beforeSelect = query.substring(0, offset);
                const lastLineBreak = beforeSelect.lastIndexOf('\n');
                const currentLineStart = lastLineBreak >= 0 ? lastLineBreak + 1 : 0;
                const selectLine = query.substring(currentLineStart, query.indexOf('\n', offset) >= 0 ? query.indexOf('\n', offset) : query.length);
                const currentIndent = selectLine.match(/^(\s*)/)?.[1] || '';
                
                // Add one more level of indentation than SELECT
                const additionalIndent = ' '.repeat(this.indentSize);
                const variableIndent = currentIndent + additionalIndent;
                
                const trimmedVars = variables.trim();
                if (!trimmedVars) {
                    return `${selectKeyword}\n${variableIndent}${distinctKeyword}`;
                }
                
                return `${selectKeyword}\n${variableIndent}${distinctKeyword} ${trimmedVars}`;
            }
        );
        
        // Handle regular SELECT (with or without DISTINCT on same line)
        result = result.replace(
            /(SELECT\s+(?:DISTINCT\s+)?)(.*?)(?=\nFROM|\nWHERE|\n\{|\n|$)/gi,
            (match, selectPart, variables, offset) => {
                if (this.isInsideQuotes(result, offset)) {
                    return match;
                }
                
                // Skip if this was already handled by the DISTINCT case above
                if (match.includes('\n')) {
                    return match;
                }
                
                // Find the current indentation level of SELECT
                const beforeSelect = result.substring(0, offset);
                const lastLineBreak = beforeSelect.lastIndexOf('\n');
                const currentLineStart = lastLineBreak >= 0 ? lastLineBreak + 1 : 0;
                const selectLine = result.substring(currentLineStart, result.indexOf('\n', offset) >= 0 ? result.indexOf('\n', offset) : result.length);
                const currentIndent = selectLine.match(/^(\s*)/)?.[1] || '';
                
                // Split variables but keep parenthetical expressions together
                const vars = this.splitVariablesKeepingParentheses(variables.trim());
                if (vars.length === 0) {
                    return selectPart.trim();
                }
                
                // Add one more level of indentation than SELECT
                const additionalIndent = ' '.repeat(this.indentSize);
                const variableIndent = currentIndent + additionalIndent;
                
                // Put everything on one indented line
                const allVars = vars.join(' ');
                return `${selectPart.split(/\s+/)[0]}\n${variableIndent}${selectPart.split(/\s+/).slice(1).join(' ')} ${allVars}`.trim();
            }
        );
        
        return result;
    }

    private splitVariablesKeepingParentheses(variables: string): string[] {
        const result: string[] = [];
        let currentVar = '';
        let parenLevel = 0;
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < variables.length; i++) {
            const char = variables[i];
            
            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
                currentVar += char;
            } else if (inQuotes && char === quoteChar) {
                inQuotes = false;
                currentVar += char;
            } else if (!inQuotes && char === '(') {
                parenLevel++;
                currentVar += char;
            } else if (!inQuotes && char === ')') {
                parenLevel--;
                currentVar += char;
            } else if (!inQuotes && parenLevel === 0 && /\s/.test(char)) {
                if (currentVar.trim()) {
                    result.push(currentVar.trim());
                    currentVar = '';
                }
            } else {
                currentVar += char;
            }
        }

        if (currentVar.trim()) {
            result.push(currentVar.trim());
        }

        return result;
    }

    private formatWhereClause(query: string): string {
        return query.replace(/WHERE\s*\{/gi, (match, offset) => {
            return this.isInsideQuotes(query, offset) ? match : 'WHERE {';
        });
    }

    private formatTriples(query: string): string {
        // Format triple patterns
        let result = query.replace(/(\w+:\w+|\?\w+|<[^>]+>)\s+(\w+:\w+|<[^>]+>|a)\s+([^.\n}]+)/g, 
            (match, subject, predicate, object, offset) => {
                return this.isInsideQuotes(query, offset) ? match : `${subject} ${predicate} ${object.trim()}`;
            });

        // Format dots and semicolons, but avoid dots inside angle brackets and quotes
        result = result.replace(/\s*\.\s*(?![^<]*>)/g, (match, offset) => {
            return this.isInsideQuotes(result, offset) ? match : ' .\n';
        });
        result = result.replace(/\s*;\s*/g, (match, offset) => {
            return this.isInsideQuotes(result, offset) ? match : ' ;\n    ';
        });

        return result;
    }

    private formatFilters(query: string): string {
        return query.replace(/FILTER\s*\(/gi, (match, offset) => {
            return this.isInsideQuotes(query, offset) ? match : 'FILTER (';
        });
    }

    private formatOptional(query: string): string {
        return query.replace(/OPTIONAL\s*\{/gi, (match, offset) => {
            return this.isInsideQuotes(query, offset) ? match : 'OPTIONAL {';
        });
    }

    private formatUnion(query: string): string {
        return query.replace(/\}\s*UNION\s*\{/gi, (match, offset) => {
            return this.isInsideQuotes(query, offset) ? match : '}\nUNION {';
        });
    }

    private formatSubqueries(query: string): string {
        // Handle nested subqueries
        let depth = 0;
        let result = '';
        
        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            if (char === '{') {
                depth++;
                result += char;
                if (i < query.length - 1 && query[i + 1] !== '\n') {
                    result += '\n';
                }
            } else if (char === '}') {
                if (result[result.length - 1] !== '\n') {
                    result += '\n';
                }
                depth--;
                result += char;
            } else {
                result += char;
            }
        }
        
        return result;
    }

    private applyIndentation(query: string): string {
        const lines = query.split('\n');
        let indentLevel = 0;
        const result: string[] = [];

        for (let line of lines) {
            line = line.trim();
            if (line === '') {
                result.push('');
                continue;
            }

            // Decrease indent for closing braces
            if (line.includes('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            // Apply indentation
            const indent = ' '.repeat(indentLevel * this.indentSize);
            result.push(indent + line);

            // Increase indent for opening braces
            if (line.includes('{')) {
                indentLevel++;
            }
        }

        return result.join('\n');
    }

    setIndentSize(size: number): void {
        this.indentSize = Math.max(1, size);
    }
}