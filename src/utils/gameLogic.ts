// utils/gameLogic.ts

/** Genera un número secreto de 4 dígitos sin repetidos */
export function generateSecret(): string {
  const digits: string[] = [];
  while (digits.length < 4) {
    const d = Math.floor(Math.random() * 10).toString();
    if (!digits.includes(d)) digits.push(d);
  }
  return digits.join('');
}

export type Feedback = { picas: number; fijas: number };

/** Evalúa un intento contra el número secreto */
export function evaluateGuess(secret: string, guess: string): Feedback {
  const secretArr = secret.split('');
  const guessArr = guess.split('');
  const usedSecret = new Array(4).fill(false);
  const usedGuess = new Array(4).fill(false);

  let fijas = 0;
  // Primero contamos las fijas (posición Y dígito correctos)
  for (let i = 0; i < 4; i++) {
    if (guessArr[i] === secretArr[i]) {
      fijas++;
      usedSecret[i] = true;
      usedGuess[i] = true;
    }
  }

  let picas = 0;
  // Luego contamos las picas (dígito correcto, posición incorrecta)
  for (let i = 0; i < 4; i++) {
    if (usedGuess[i]) continue;
    for (let j = 0; j < 4; j++) {
      if (usedSecret[j]) continue;
      if (guessArr[i] === secretArr[j]) {
        picas++;
        usedSecret[j] = true;
        break;
      }
    }
  }

  return { picas, fijas };
}

/** Valida que un intento sea válido: 4 dígitos, sin repetidos */
export function isValidGuess(guess: string): boolean {
  return /^\d{4}$/.test(guess) && new Set(guess).size === 4;
}