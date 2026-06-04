export class Renderer {
  constructor(containerEl) {
    this.container = containerEl;
  }

  showSkeleton() {
    const widths = ['80%', '60%', '90%', '50%', '70%'];
    const fragment = document.createDocumentFragment();
    for (const w of widths) {
      const div = document.createElement('div');
      div.className = 'skeleton-line';
      div.style.width = w;
      fragment.appendChild(div);
    }
    this.container.appendChild(fragment);
  }

  hideSkeleton() {
    const skeletons = this.container.querySelectorAll('.skeleton-line');
    for (const el of skeletons) {
      el.remove();
    }
  }

  appendStreamToken(token) {
    let content = this.container.querySelector('.explanation-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'explanation-content';
      this.container.appendChild(content);
    }
    content.insertAdjacentHTML('beforeend', token);
    content.scrollTop = content.scrollHeight;
  }

  renderComplete(data) {
    this.clear();

    const explanation = document.createElement('div');
    explanation.className = 'explanation-content';
    explanation.textContent = data.explanation || '';
    this.container.appendChild(explanation);

    if (data.complexity !== undefined) {
      this.container.appendChild(this.renderComplexityBar(data.complexity));
    }

    if (data.smells && data.smells.length) {
      const wrapper = document.createElement('div');
      wrapper.className = 'smells-section';
      const header = document.createElement('div');
      header.className = 'section-header';
      header.textContent = `⚠️ Code Smells (${data.smells.length})`;
      wrapper.appendChild(header);
      for (const smell of data.smells) {
        wrapper.appendChild(this.renderSmellItem(smell));
      }
      this.container.appendChild(wrapper);
    }

    if (data.analogies && data.analogies.length) {
      const wrapper = document.createElement('div');
      wrapper.className = 'analogies-section';
      const header = document.createElement('div');
      header.className = 'section-header';
      header.textContent = '💡 Analogies';
      wrapper.appendChild(header);
      const grid = document.createElement('div');
      grid.className = 'analogies-grid';
      for (const a of data.analogies) {
        grid.appendChild(this.renderAnalogyCard(a));
      }
      wrapper.appendChild(grid);
      this.container.appendChild(wrapper);
    }

    if (data.concepts && data.concepts.length) {
      const wrapper = document.createElement('div');
      wrapper.className = 'concepts-section';
      const header = document.createElement('div');
      header.className = 'section-header';
      header.textContent = '📚 Key Concepts';
      wrapper.appendChild(header);
      const chips = document.createElement('div');
      chips.className = 'chips-container';
      for (const c of data.concepts) {
        chips.appendChild(this.renderConceptChip(c));
      }
      wrapper.appendChild(chips);
      this.container.appendChild(wrapper);
    }
  }

  renderComplexityBar(score) {
    const section = document.createElement('div');
    section.className = 'complexity-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `🔥 Complexity: <span class="complexity-score">${score}</span>/10`;
    section.appendChild(header);

    const bar = document.createElement('div');
    bar.className = 'complexity-bar';

    const fill = document.createElement('div');
    fill.className = 'complexity-fill';
    fill.style.width = `${Math.min(Math.max(score, 0), 10) * 10}%`;

    let color;
    if (score <= 3) {
      color = '#4caf50';
    } else if (score <= 6) {
      color = '#ffc107';
    } else {
      color = '#f44336';
    }
    fill.style.background = color;

    bar.appendChild(fill);
    section.appendChild(bar);

    return section;
  }

  renderSmellItem(smell) {
    const div = document.createElement('div');
    div.className = 'smell-item';
    if (smell.line !== undefined) {
      div.dataset.line = smell.line;
    }

    const icon = document.createElement('span');
    icon.className = `smell-icon smell-${smell.severity || 'warning'}`;
    div.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'smell-content';

    const type = document.createElement('span');
    type.className = 'smell-type';
    type.textContent = smell.type || '';
    content.appendChild(type);

    const msg = document.createElement('span');
    msg.className = 'smell-message';
    msg.textContent = smell.message || '';
    content.appendChild(msg);

    div.appendChild(content);

    if (smell.line !== undefined) {
      const btn = document.createElement('button');
      btn.className = 'btn-icon smell-goto';
      btn.title = 'Go to line';
      btn.textContent = '→';
      div.appendChild(btn);
    }

    return div;
  }

  renderAnalogyCard(analogy) {
    const card = document.createElement('div');
    card.className = 'analogy-card';

    const icon = document.createElement('div');
    icon.className = 'analogy-icon';
    icon.textContent = analogy.icon || '💡';
    card.appendChild(icon);

    const body = document.createElement('div');
    body.className = 'analogy-body';

    const concept = document.createElement('div');
    concept.className = 'analogy-concept';
    concept.textContent = analogy.concept || '';
    body.appendChild(concept);

    const text = document.createElement('div');
    text.className = 'analogy-text';
    text.textContent = analogy.analogy || '';
    body.appendChild(text);

    card.appendChild(body);

    return card;
  }

  renderConceptChip(concept) {
    const btn = document.createElement('button');
    btn.className = 'chip concept-chip';
    const term = typeof concept === 'string' ? concept : concept.term || concept.name || String(concept);
    btn.dataset.concept = term;
    btn.textContent = term;
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('codelens:search-glossary', {
        detail: { term }
      }));
    });
    return btn;
  }

  showEmptyState() {
    this.clear();
    const div = document.createElement('div');
    div.className = 'empty-state';
    const html = `
      <div class="empty-illustration">🔍</div>
      <div class="empty-title">No explanation yet</div>
      <div class="empty-prompt">Select a line of code to get an AI-powered explanation</div>
    `;
    div.innerHTML = html;
    this.container.appendChild(div);
  }

  showError(message) {
    this.clear();
    const banner = document.createElement('div');
    banner.className = 'error-banner';
    const html = `
      <div class="error-message">${message}</div>
      <button class="btn btn-retry">Retry</button>
    `;
    banner.innerHTML = html;
    this.container.appendChild(banner);
  }

  clear() {
    this.container.innerHTML = '';
  }
}
