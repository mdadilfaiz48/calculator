import { Component, signal, computed, HostListener, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css',
})
export class CalculatorComponent {
  /** The current number shown on the display */
  protected readonly displayValue = signal('0');

  /** The first operand stored when an operator is pressed */
  protected readonly firstOperand = signal<number | null>(null);

  /** The current operator (+, -, ×, ÷, %) */
  protected readonly operator = signal<string | null>(null);

  /** Whether we are waiting for the second operand input */
  protected readonly waitingForSecondOperand = signal(false);

  /** Expression string shown above the main display */
  protected readonly expression = signal('');

  /** Reference to the calculator card for 3D effect */
  private readonly card = viewChild<ElementRef>('calculatorCard');

  /** Computed: format display for large numbers */
  protected readonly formattedDisplay = computed(() => {
    const val = this.displayValue();
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (val.endsWith('.') || val.endsWith('.0') || /\.\d*0$/.test(val)) return val;
    if (Math.abs(num) >= 1e12) return num.toExponential(4);
    return val;
  });

  /** Floating math symbols for the background animation */
  protected readonly floatingSymbols = [
    { char: '+', delay: '0s', duration: '18s', left: '5%', size: '2.5rem' },
    { char: '−', delay: '2s', duration: '22s', left: '15%', size: '3rem' },
    { char: '×', delay: '4s', duration: '16s', left: '25%', size: '2rem' },
    { char: '÷', delay: '1s', duration: '20s', left: '35%', size: '3.5rem' },
    { char: '%', delay: '3s', duration: '24s', left: '45%', size: '2.2rem' },
    { char: '=', delay: '5s', duration: '19s', left: '55%', size: '2.8rem' },
    { char: 'π', delay: '0.5s', duration: '21s', left: '65%', size: '3rem' },
    { char: '√', delay: '3.5s', duration: '17s', left: '75%', size: '2.5rem' },
    { char: '∑', delay: '1.5s', duration: '23s', left: '85%', size: '2rem' },
    { char: '∞', delay: '4.5s', duration: '15s', left: '92%', size: '3.2rem' },
  ];

  /** 3D Tilt Effect on mouse movement (Desktop only) */
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const el = this.card()?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (centerY - y) / 20;
    const rotateY = (x - centerX) / 20;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  }

  /** Reset tilt when mouse leaves */
  @HostListener('mouseleave')
  onMouseLeave() {
    const el = this.card()?.nativeElement;
    if (!el) return;
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  }

  /** Handle digit button presses (0-9) */
  onDigit(digit: string): void {
    if (this.waitingForSecondOperand()) {
      this.displayValue.set(digit);
      this.waitingForSecondOperand.set(false);
    } else {
      const current = this.displayValue();
      this.displayValue.set(current === '0' ? digit : current + digit);
    }
  }

  /** Handle decimal point */
  onDecimal(): void {
    if (this.waitingForSecondOperand()) {
      this.displayValue.set('0.');
      this.waitingForSecondOperand.set(false);
      return;
    }
    if (!this.displayValue().includes('.')) {
      this.displayValue.set(this.displayValue() + '.');
    }
  }

  /** Handle operator presses (+, -, ×, ÷, %) */
  onOperator(op: string): void {
    const inputValue = parseFloat(this.displayValue());

    if (this.firstOperand() !== null && !this.waitingForSecondOperand()) {
      const result = this.calculate(this.firstOperand()!, this.operator()!, inputValue);
      const resultStr = this.formatResult(result);
      this.displayValue.set(resultStr);
      this.firstOperand.set(result);
      this.expression.set(`${resultStr} ${op}`);
    } else {
      this.firstOperand.set(inputValue);
      this.expression.set(`${this.displayValue()} ${op}`);
    }

    this.operator.set(op);
    this.waitingForSecondOperand.set(true);
  }

  /** Handle equals */
  onEquals(): void {
    if (this.firstOperand() === null || this.operator() === null) return;

    const inputValue = parseFloat(this.displayValue());
    const result = this.calculate(this.firstOperand()!, this.operator()!, inputValue);
    const resultStr = this.formatResult(result);

    this.expression.set(`${this.firstOperand()} ${this.operator()} ${inputValue} =`);
    this.displayValue.set(resultStr);
    this.firstOperand.set(null);
    this.operator.set(null);
    this.waitingForSecondOperand.set(false);
  }

  /** Clear all state */
  onClear(): void {
    this.displayValue.set('0');
    this.firstOperand.set(null);
    this.operator.set(null);
    this.waitingForSecondOperand.set(false);
    this.expression.set('');
  }

  /** Delete last character */
  onDelete(): void {
    const current = this.displayValue();
    if (current.length === 1 || (current.length === 2 && current.startsWith('-'))) {
      this.displayValue.set('0');
    } else {
      this.displayValue.set(current.slice(0, -1));
    }
  }

  /** Toggle positive/negative */
  onToggleSign(): void {
    const current = this.displayValue();
    if (current === '0') return;
    this.displayValue.set(current.startsWith('-') ? current.slice(1) : '-' + current);
  }

  /** Core calculation logic */
  private calculate(first: number, op: string, second: number): number {
    switch (op) {
      case '+': return first + second;
      case '−': return first - second;
      case '×': return first * second;
      case '÷': return second !== 0 ? first / second : NaN;
      case '%': return first % second;
      default: return second;
    }
  }

  /** Format result to avoid floating point issues */
  private formatResult(value: number): string {
    if (isNaN(value)) return 'Error';
    if (!isFinite(value)) return 'Error';
    const rounded = Math.round(value * 1e10) / 1e10;
    return String(rounded);
  }
}
