export function optimizeMarkdown(text) {
        // Unify line endings to \n
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = text.split('\n');
        let result = [];
        let inCodeBlock = false;

        // Step 1: Format lines & handle code blocks
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          // Check code block fence (allow indentation up to 3 spaces per commonmark)
          const isCodeBlockBoundary = line.trimStart().startsWith('```');

          if (isCodeBlockBoundary) {
            if (!inCodeBlock) {
              // Ensure blank line BEFORE opening code block
              if (result.length > 0 && result[result.length - 1].trim() !== '') {
                result.push('');
              }
              inCodeBlock = true;
              result.push(line);
            } else {
              // Closing code block
              inCodeBlock = false;
              result.push(line);
              // Ensure blank line AFTER closing code block
              result.push('');
            }
            continue;
          }

          if (inCodeBlock) {
            // Do not format content inside code block
            result.push(line);
            continue;
          }

          // --- Format Markdown Elements outside code blocks ---
          line = line.trimEnd();

          // Headers: Ensure space after #
          line = line.replace(/^(#{1,6})(?!\s)(.*)/, '$1 $2');

          // Unordered lists: Ensure space after -, *, +
          line = line.replace(/^(\s*)([-*+])(?!\s)(.*)/, '$1$2 $3');

          // Ordered lists: Ensure space after number.
          line = line.replace(/^(\s*)(\d+\.)(?!\s)(.*)/, '$1$2 $3');

          // Blockquotes: Ensure space after >
          line = line.replace(/^(\s*)(>+)(?!\s)(.*)/, '$1$2 $3');

          result.push(line);
        }

        // Step 2: Remove blank lines, but keep one blank line before lines starting with 【
        let finalResult = [];

        for (let i = 0; i < result.length; i++) {
          let line = result[i];

          // 跳过空行
          if (line.trim() === '') {
            continue;
          }

          // 如果当前行以【开头,且不是第一行,则在前面添加一个空行
          if (line.trim().startsWith('【') && finalResult.length > 0) {
            finalResult.push('');
          }

          finalResult.push(line);
        }

        // Remove trailing blank lines
        while (finalResult.length > 0 && finalResult[finalResult.length - 1] === '') {
          finalResult.pop();
        }

        // 在最顶部增加三个空行
        return '\n\n\n' + finalResult.join('\n');
      }
