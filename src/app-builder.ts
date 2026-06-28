import * as THREE from 'three';
import { ThreeViewer } from './viewer';
import { exportSTL, downloadSTL, getTriangleCount } from './exporter';
import { ParamSchema, RangeParamSchema, CheckboxParamSchema, FixtureParameters } from './schema';

export interface AppConfig<F extends FixtureParameters> {

  title: string;
  tagline: string;
  styles: Record<string, F>;
  generator: (params: F) => THREE.Mesh[];
  exportNamePrefix: string;
}

export class AppBuilder<F extends FixtureParameters> {
  private config: AppConfig<F>;
  private viewer: ThreeViewer;

  // DOM elements
  private activeStyle: F;
  private controlsContainer: HTMLElement;
  private btnExport!: HTMLButtonElement;
  private exportStats!: HTMLElement;
  private statsBadge!: HTMLElement;
  private styleButtons: Record<string, HTMLButtonElement> = {};

  constructor(
    config: AppConfig<F>,
    controlsContainerId: string,
    canvasContainerId: string
  ) {
    this.config = config;
    this.activeStyle = Object.values(config.styles)[0];

    const canvasContainer = document.getElementById(canvasContainerId);
    const controlsContainer = document.getElementById(controlsContainerId);
    if (!canvasContainer || !controlsContainer) {
      throw new Error(`Containers not found: ${canvasContainerId}, ${controlsContainerId}`);
    }
    this.controlsContainer = controlsContainer;

    // Apply branding titles and reference default components
    this.setupLayoutElements();

    // Initialize Three.js scene
    this.viewer = new ThreeViewer(canvasContainer);

    // Render configuration inputs in the sidebar
    this.renderUI();

    // Bind style and export button handlers
    this.bindActions();

    // Initial render
    this.updateApp();
  }

  private setupLayoutElements() {
    const h1 = document.querySelector('.app-header h1');
    const tagline = document.querySelector('.app-header .tagline');
    if (h1) h1.textContent = this.config.title;
    if (tagline) tagline.textContent = this.config.tagline;

    this.btnExport = document.getElementById('btn-export') as HTMLButtonElement;
    this.exportStats = document.getElementById('export-stats')!;
    this.statsBadge = document.getElementById('stats-badge')!;
  }

  private renderUI() {
    this.controlsContainer.innerHTML = '';


    const styleContainer = document.getElementById('style-buttons-container');
    if (styleContainer) {
      styleContainer.innerHTML = '';
      let isFirst = true;
      Object.keys(this.config.styles).forEach(key => {
        const btn = document.createElement('button');
        btn.className = `btn btn-secondary${isFirst ? ' active' : ''}`;
        btn.id = `style-${key}`;
        btn.dataset.style = key;

        btn.textContent = this.config.styles[key].displayStyleName;

        styleContainer.appendChild(btn);
        this.styleButtons[key] = btn;
        btn.addEventListener('click', () => this.applyStyle(key));
        isFirst = false;
      });
    }

    this.renderInputButtons(this.activeStyle);

  }

  private renderInputButtons(paramSchema: F) {
    const section = document.createElement('section');
    section.className = 'parameter-section';
    this.controlsContainer.appendChild(section);

    paramSchema.params.forEach(item => {
      if (item.type === 'range') {
        const rangeParam = item as RangeParamSchema;
        const group = document.createElement('div');
        group.className = 'input-group';
        group.id = `group-${rangeParam.id}`;

        const header = document.createElement('div');
        header.className = 'input-header';

        const label = document.createElement('label');
        label.setAttribute('for', `input-${rangeParam.id}`);
        label.textContent = rangeParam.label;

        const valSpan = document.createElement('span');
        valSpan.className = 'value-display';
        valSpan.id = `val-${rangeParam.id}`;
        valSpan.textContent = String(item.default);

        header.appendChild(label);
        header.appendChild(valSpan);

        const input = document.createElement('input');
        input.type = 'range';
        input.id = `input-${rangeParam.id}`;
        input.min = String(rangeParam.min ?? 0);
        input.max = String(rangeParam.max ?? 100);
        input.step = String(rangeParam.step ?? 1);
        input.value = String(rangeParam.value);

        input.addEventListener('input', () => {
          rangeParam.value = parseFloat(input.value);
          this.clearActiveStyleStyles();
          this.updateApp();
        });

        group.appendChild(header);
        group.appendChild(input);
        section.appendChild(group);

      } else if (item.type === 'checkbox') {
        const checkboxParam = item as CheckboxParamSchema;
        const group = document.createElement('div');
        group.className = 'input-group-checkbox';
        group.id = `group-${checkboxParam.id}`;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `input-${checkboxParam.id}`;
        input.checked = checkboxParam.value;

        const label = document.createElement('label');
        label.setAttribute('for', `input-${checkboxParam.id}`);
        label.textContent = checkboxParam.label;

        input.addEventListener('change', () => {
          checkboxParam.value = input.checked;
          this.clearActiveStyleStyles();
          this.updateApp();
        });

        group.appendChild(input);
        group.appendChild(label);
        section.appendChild(group);
      }
    });
  }

  private bindActions() {
    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => this.handleExport());
    }
  }

  private applyStyle(name: string) {
    const style = this.config.styles[name];
    this.activeStyle = style;

    for (const [key, sourceParam] of style.params.entries()) {
      const param = this.activeStyle.params.get(key) as ParamSchema;
      if (!param) continue;

      param.value = sourceParam.value;
      const input = document.getElementById(`input-${param.id}`) as HTMLInputElement;
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(param.value);
        } else {
          input.value = String(param.value);
        }
      }
    }

    Object.keys(this.styleButtons).forEach(key => {
      this.styleButtons[key].classList.toggle('active', key === name);
    });

    this.updateApp();
  }

  private clearActiveStyleStyles() {
    Object.keys(this.styleButtons).forEach(key => {
      this.styleButtons[key].classList.remove('active');
    });
  }

  private updateApp() {
    // 1. Evaluate conditional visibility (showIf)
    this.activeStyle.params.forEach(item => {
      const group = document.getElementById(`group-${item.id}`);
      if (group) {
        const isVisible = item.showIf ? item.showIf(this.activeStyle) : true;
        group.classList.toggle('hidden', !isVisible);
      }
    });

    // 2. Sync values with display badges in the UI
    this.activeStyle.params.forEach(item => {
      const display = document.getElementById(`val-${item.id}`);
      if (display) {
        if (item.type === 'range') {
          const rangeParam = item as RangeParamSchema;
          const value = rangeParam.value;
          const decimals = (rangeParam.step && rangeParam.step % 1 !== 0) ? 1 : 0;
          display.textContent = (typeof value === 'number')
            ? value.toFixed(decimals) + (rangeParam.unit ? ` ${rangeParam.unit}` : '')
            : String(value);
        } else if (item.type === 'checkbox') {
          const checkboxParam = item as CheckboxParamSchema;
          const value = checkboxParam.value;
          display.textContent = String(value);
        }
      }
    });

    // 3. Request new geometry from user callback
    const meshes = this.config.generator(this.activeStyle);

    // 4. Update the viewer
    this.viewer.setMeshes(meshes);

    // 5. Update stats cards
    if (this.statsBadge) {
      const parts: string[] = ['end'];
      if (parts.length > 0) {
        this.statsBadge.textContent = `Dimension: ${parts.join(' x ')} mm`;
      }
    }

    if (this.exportStats) {
      const triangles = getTriangleCount(meshes);
      const fileSizeBytes = 84 + (triangles * 50);
      const fileSizeKB = fileSizeBytes / 1024;
      this.exportStats.textContent = `Triangles: ${triangles.toLocaleString()} | Est. Size: ${fileSizeKB.toFixed(1)} KB`;
    }
  }

  private handleExport() {
    const meshes = this.viewer.getMeshes();
    if (meshes.length === 0) return;

    const filename = `${this.activeStyle.generateFilename()}.stl`;

    const buffer = exportSTL(meshes);

    const originalContent = this.btnExport.innerHTML;
    this.btnExport.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Generating...
    `;
    this.btnExport.disabled = true;

    setTimeout(() => {
      downloadSTL(buffer, filename);
      this.btnExport.innerHTML = originalContent;
      this.btnExport.disabled = false;
    }, 450);
  }
}
