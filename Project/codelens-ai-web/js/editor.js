export class CodeEditor {
  constructor(container) {
    this.container = container;
    this.markers = [];
    this._changeTimer = null;
    this._lineHeight = 20;
    this._boundInput = this._onInput.bind(this);
    this._boundKeydown = this._onKeydown.bind(this);
    this._boundScroll = this._syncScroll.bind(this);
    this._boundDragOver = this._onDragOver.bind(this);
    this._boundDrop = this._onDrop.bind(this);
    this._boundPaste = this._onPasteAction.bind(this);
    this._boundSample = this._onSampleAction.bind(this);
    this._boundClear = this._onClearAction.bind(this);
    this.el = null;
    this.textarea = null;
    this.gutter = null;
    this.languageSelect = null;
  }

  init() {
    this.container.innerHTML = '';
    this.container.__editor = this;
    this.el = document.createElement('div');
    this.el.className = 'code-editor';

    const samples = {
      javascript: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconst result = fibonacci(10);\nconsole.log(\`fib(10) = \${result}\`);`,
      typescript: `interface User {\n  id: number;\n  name: string;\n  email: string;\n}\nasync function fetchUser(id: number): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json();\n}`,
      python: `def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)`,
      java: `public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
      go: `package main\nimport "fmt"\nfunc main() {\n  nums := []int{1, 2, 3, 4, 5}\n  sum := 0\n  for _, n := range nums {\n    sum += n\n  }\n  fmt.Println("Sum:", sum)\n}`,
      rust: `fn main() {\n  let numbers = vec![1, 2, 3, 4, 5];\n  let sum: i32 = numbers.iter().sum();\n  println!("Sum: {}", sum);\n}`,
      cpp: `#include <iostream>\nint main() {\n  std::cout << "Hello, C++!" << std::endl;\n  return 0;\n}`,
      csharp: `using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, C#!");\n  }\n}`,
      ruby: `def factorial(n)\n  n <= 1 ? 1 : n * factorial(n - 1)\nend\nputs factorial(5)`,
      php: `<?php\nfunction greet($name) {\n  return "Hello, $name!";\n}\necho greet("World");`,
      swift: `func fibonacci(_ n: Int) -> Int {\n  if n <= 1 { return n }\n  return fibonacci(n - 1) + fibonacci(n - 2)\n}\nprint(fibonacci(10))`,
      kotlin: `fun main() {\n  val numbers = listOf(1, 2, 3, 4, 5)\n  val doubled = numbers.map { it * 2 }\n  println(doubled)\n}`,
      scala: `object Hello {\n  def main(args: Array[String]): Unit = {\n    println("Hello, Scala!")\n  }\n}`,
      sql: `SELECT u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) > 0\nORDER BY order_count DESC;`,
      r: `data <- data.frame(\n  name = c("Alice", "Bob", "Charlie"),\n  score = c(95, 87, 92)\n)\nsummary(data)`
    };

    const langOptions = [
      ['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['python', 'Python'],
      ['java', 'Java'], ['go', 'Go'], ['rust', 'Rust'], ['cpp', 'C++'],
      ['csharp', 'C#'], ['ruby', 'Ruby'], ['php', 'PHP'], ['swift', 'Swift'],
      ['kotlin', 'Kotlin'], ['scala', 'Scala'], ['sql', 'SQL'], ['r', 'R']
    ];

    const select = document.createElement('select');
    select.className = 'language-select';
    for (const [val, label] of langOptions) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = label;
      select.appendChild(opt);
    }
    select.value = 'javascript';
    this.languageSelect = select;

    const pasteBtn = document.createElement('button');
    pasteBtn.className = 'btn-icon';
    pasteBtn.dataset.action = 'paste';
    pasteBtn.title = 'Paste';
    pasteBtn.textContent = '\uD83D\uDCCB';

    const sampleBtn = document.createElement('button');
    sampleBtn.className = 'btn-icon';
    sampleBtn.dataset.action = 'sample';
    sampleBtn.title = 'Sample Code';
    sampleBtn.textContent = '\uD83D\uDCC4';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn-icon';
    clearBtn.dataset.action = 'clear';
    clearBtn.title = 'Clear';
    clearBtn.textContent = '\uD83D\uDDD1\uFE0F';

    const actions = document.createElement('div');
    actions.className = 'editor-actions';
    actions.appendChild(pasteBtn);
    actions.appendChild(sampleBtn);
    actions.appendChild(clearBtn);

    const header = document.createElement('div');
    header.className = 'editor-header';
    header.appendChild(select);
    header.appendChild(actions);

    this.gutter = document.createElement('div');
    this.gutter.className = 'gutter';

    this.textarea = document.createElement('textarea');
    this.textarea.className = 'code-textarea';
    this.textarea.spellcheck = false;
    this.textarea.setAttribute('autocorrect', 'off');
    this.textarea.setAttribute('autocapitalize', 'off');
    this.textarea.placeholder = 'Paste or type your code here...';

    const body = document.createElement('div');
    body.className = 'editor-body';
    body.appendChild(this.gutter);
    body.appendChild(this.textarea);

    this.el.appendChild(header);
    this.el.appendChild(body);

    this.container.appendChild(this.el);

    this._samples = samples;

    this.textarea.addEventListener('input', this._boundInput);
    this.textarea.addEventListener('keydown', this._boundKeydown);
    this.textarea.addEventListener('scroll', this._boundScroll);
    this.el.addEventListener('dragover', this._boundDragOver);
    this.el.addEventListener('drop', this._boundDrop);
    pasteBtn.addEventListener('click', this._boundPaste);
    sampleBtn.addEventListener('click', this._boundSample);
    clearBtn.addEventListener('click', this._boundClear);

    this.updateGutter();
  }

  _emit(name, detail) {
    this.el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }

  _onInput() {
    this.updateGutter();
    clearTimeout(this._changeTimer);
    this._changeTimer = setTimeout(() => {
      this._emit('codelens:code-change', { code: this.getCode(), language: this.getLanguage() });
    }, 300);
  }

  _onKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      this.textarea.value = this.textarea.value.substring(0, start) + '  ' + this.textarea.value.substring(end);
      this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
      this._onInput();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this._emit('codelens:explain-request', { code: this.getCode(), language: this.getLanguage() });
    }
  }

  _syncScroll() {
    this.gutter.scrollTop = this.textarea.scrollTop;
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  _onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.setCode(reader.result);
    };
    reader.readAsText(file);
  }

  async _onPasteAction() {
    try {
      const text = await navigator.clipboard.readText();
      this.setCode(text);
      this._emit('codelens:paste', { code: text });
      this._emit('codelens:code-change', { code: this.getCode(), language: this.getLanguage() });
    } catch {
      this.textarea.focus();
      document.execCommand('paste');
    }
  }

  _onSampleAction() {
    const lang = this.getLanguage();
    const code = this._samples[lang] || '';
    this.setCode(code);
    this._emit('codelens:load-sample', { language: lang, code });
    this._emit('codelens:code-change', { code, language: lang });
  }

  _onClearAction() {
    this.clear();
    this._emit('codelens:code-change', { code: '', language: this.getLanguage() });
  }

  getCode() {
    return this.textarea.value;
  }

  setCode(code) {
    this.textarea.value = code;
    this.updateGutter();
  }

  getLanguage() {
    return this.languageSelect ? this.languageSelect.value : 'javascript';
  }

  setLanguage(lang) {
    if (this.languageSelect) this.languageSelect.value = lang;
  }

  updateGutter() {
    const lines = this.textarea.value.split('\n');
    const count = lines.length;
    const frag = document.createDocumentFragment();

    for (let i = 1; i <= count; i++) {
      const lineEl = document.createElement('div');
      lineEl.className = 'gutter-line';
      lineEl.dataset.line = i;

      const num = document.createElement('span');
      num.className = 'gutter-line-number';
      num.textContent = i;
      lineEl.appendChild(num);

      const marker = this.markers.find(m => m.line === i);
      if (marker) {
        const dot = document.createElement('span');
        dot.className = `gutter-marker gutter-marker-${marker.type}`;
        if (marker.type === 'complexity') {
          dot.textContent = '\u25CF';
          dot.style.color = marker.severity === 'high' ? '#e74c3c' : marker.severity === 'medium' ? '#f39c12' : '#2ecc71';
        } else if (marker.type === 'smell') {
          dot.textContent = '\u26A0\uFE0F';
        }
        lineEl.appendChild(dot);
      }

      frag.appendChild(lineEl);
    }

    this.gutter.innerHTML = '';
    this.gutter.appendChild(frag);

    this.textarea.style.minHeight = '0';
    this.textarea.style.height = 'auto';
    this.textarea.style.height = Math.max(this.textarea.scrollHeight, 200) + 'px';
  }

  setGutterMarkers(markers) {
    this.markers = markers;
    this.updateGutter();
  }

  clearGutterMarkers() {
    this.markers = [];
    this.updateGutter();
  }

  getSelection() {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    if (start === end) return null;
    return { start, end };
  }

  focus() {
    this.textarea.focus();
  }

  clear() {
    this.setCode('');
  }

  loadSample(language) {
    this.setLanguage(language);
    const code = this._samples[language] || '';
    this.setCode(code);
    return code;
  }

  destroy() {
    this.textarea.removeEventListener('input', this._boundInput);
    this.textarea.removeEventListener('keydown', this._boundKeydown);
    this.textarea.removeEventListener('scroll', this._boundScroll);
    this.el.removeEventListener('dragover', this._boundDragOver);
    this.el.removeEventListener('drop', this._boundDrop);
    clearTimeout(this._changeTimer);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
}
