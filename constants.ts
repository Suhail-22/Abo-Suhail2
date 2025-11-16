import { ButtonConfig } from './types';

export const defaultButtonLayout: ButtonConfig[] = [
    // Row 1
    { id: 'divide', label: '÷', value: '÷', type: 'operator' },
    { id: 'percent', label: '%', value: '%', type: 'function' },
    { id: 'ans', label: 'Ans', action: 'appendAnswer', type: 'function' },
    { id: 'backspace', label: '←', action: 'backspace', type: 'function' },
    { id: 'ac', label: 'AC', action: 'clear', type: 'function' },
    
    // Row 2
    { id: 'multiply', label: '×', value: '×', type: 'operator' },
    { id: 'sign', label: '±', action: 'toggleSign', type: 'function' },
    { id: '9', label: '9', value: '9', type: 'number' },
    { id: '8', label: '8', value: '8', type: 'number' },
    { id: '7', label: '7', value: '7', type: 'number' },

    // Row 3
    { id: 'subtract', label: '-', value: '-', type: 'operator' },
    { id: 'paren', label: '( )', action: 'parenthesis', type: 'function' },
    { id: '6', label: '6', value: '6', type: 'number' },
    { id: '5', label: '5', value: '5', type: 'number' },
    { id: '4', label: '4', value: '4', type: 'number' },

    // Row 4
    { id: 'add', label: '+', value: '+', type: 'operator' },
    { id: 'decimal', label: '.', value: '.', type: 'number' },
    { id: '3', label: '3', value: '3', type: 'number' },
    { id: '2', label: '2', value: '2', type: 'number' },
    { id: '1', label: '1', value: '1', type: 'number' },
    
    // Row 5
    { id: 'equals', label: '=', action: 'calculate', type: 'equals', span: 2 },
    { id: '000', label: '000', value: '000', type: 'number' },
    { id: '00', label: '00', value: '00', type: 'number' },
    { id: '0', label: '0', value: '0', type: 'number' },
];
