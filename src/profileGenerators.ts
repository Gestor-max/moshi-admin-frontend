/**
 * ==============================================================================
 * 🛠️ GENERADOR DE CONTRASEÑAS Y CORREOS DE RECUPERACIÓN (MOSHI ADMIN)
 * ==============================================================================
 * Este archivo contiene:
 * 1. La variable de dominio configurable (DEFAULT_RECOVERY_DOMAIN).
 * 2. Las listas editables de NOMBRES y APELLIDOS para generar correos.
 * 3. Funciones utilitarias para generar correos y contraseñas seguras para Google.
 */

// ==============================================================================
// 🌐 1. DOMINIO CONFIGURABLE POR DEFECTO
// ==============================================================================
// Puedes cambiar este dominio cuando lo desees (ej: '@ppcguru.us', '@minegocio.com', etc.)
export const DEFAULT_RECOVERY_DOMAIN = '@ppcguru.us';

// ==============================================================================
// 👤 2. LISTA DE NOMBRES EN INGLÉS (MODIFICABLE)
// First names 100% en inglés (femeninos y masculinos).
// ==============================================================================
export const NOMBRES: string[] = [
  // Male English Names
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'charles', 'joseph', 'thomas',
  'christopher', 'daniel', 'paul', 'mark', 'donald', 'george', 'kenneth', 'steven', 'edward', 'brian',
  'ronald', 'anthony', 'kevin', 'jason', 'matthew', 'gary', 'timothy', 'larry', 'jeffrey', 'frank',
  'scott', 'eric', 'stephen', 'andrew', 'raymond', 'gregory', 'joshua', 'jerry', 'dennis', 'walter',
  'patrick', 'peter', 'harold', 'douglas', 'henry', 'carl', 'arthur', 'ryan', 'roger', 'joe',
  'jack', 'albert', 'jonathan', 'justin', 'terry', 'gerald', 'keith', 'samuel', 'willie', 'ralph',
  'lawrence', 'nicholas', 'roy', 'benjamin', 'bruce', 'brandon', 'adam', 'harry', 'fred', 'wayne',
  'billy', 'steve', 'louis', 'jeremy', 'aaron', 'randy', 'howard', 'eugene', 'russell', 'bobby',
  'victor', 'martin', 'ernest', 'phillip', 'todd', 'jesse', 'craig', 'alan', 'shawn', 'clarence',
  'sean', 'philip', 'chris', 'johnny', 'earl', 'jimmy', 'lucas', 'nathan', 'ethan', 'mason',
  // Female English Names
  'mary', 'patricia', 'linda', 'barbara', 'elizabeth', 'jennifer', 'susan', 'margaret', 'dorothy', 'lisa',
  'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle',
  'laura', 'sarah', 'kimberly', 'deborah', 'jessica', 'shirley', 'cynthia', 'angela', 'melissa', 'brenda',
  'amy', 'anna', 'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda', 'stephanie',
  'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce', 'diane', 'alice',
  'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn', 'jean', 'cheryl', 'mildred', 'katherine',
  'joan', 'ashley', 'judith', 'rose', 'janice', 'kelly', 'nicole', 'judy', 'christina', 'kathy',
  'theresa', 'beverly', 'denise', 'tammy', 'irene', 'jane', 'lori', 'rachel', 'marilyn', 'andrea',
  'kathryn', 'louise', 'sara', 'anne', 'jacqueline', 'wanda', 'bonnie', 'julia', 'ruby', 'lois',
  'tina', 'phyllis', 'norma', 'paula', 'diana', 'annie', 'lillian', 'emily', 'robin', 'megan'
];

// ==============================================================================
// 👥 3. LISTA DE APELLIDOS EN INGLÉS (MODIFICABLE)
// Last names / Surnames 100% en inglés.
// ==============================================================================
export const APELLIDOS: string[] = [
  'smith', 'johnson', 'williams', 'brown', 'jones', 'miller', 'davis', 'wilson', 'anderson', 'taylor',
  'thomas', 'moore', 'jackson', 'martin', 'lee', 'thompson', 'white', 'harris', 'clark', 'lewis',
  'robinson', 'walker', 'young', 'allen', 'king', 'wright', 'scott', 'hill', 'green', 'adams',
  'baker', 'hall', 'campbell', 'mitchell', 'carter', 'roberts', 'turner', 'phillips', 'evans', 'foster',
  'parker', 'edwards', 'collins', 'stewart', 'morris', 'rogers', 'reed', 'cook', 'morgan', 'bell',
  'murphy', 'bailey', 'cooper', 'richardson', 'cox', 'howard', 'ward', 'peterson', 'gray', 'watson',
  'brooks', 'kelly', 'sanders', 'price', 'bennett', 'wood', 'barnes', 'ross', 'henderson', 'coleman',
  'jenkins', 'perry', 'powell', 'long', 'patterson', 'hughes', 'floyd', 'butler', 'simmons', 'foster',
  'bryant', 'alexander', 'russell', 'griffin', 'hayes', 'myers', 'ford', 'hamilton', 'graham', 'sullivan',
  'wallace', 'woods', 'cole', 'west', 'jordan', 'owens', 'reynolds', 'fisher', 'ellis', 'harrison',
  'gibson', 'mcdonald', 'marshall', 'murray', 'freeman', 'wells', 'webb', 'simpson', 'stevens', 'tucker',
  'porter', 'hunter', 'hicks', 'crawford', 'henry', 'boyd', 'mason', 'warren', 'dixon', 'burns',
  'gordon', 'shaw', 'holmes', 'rice', 'robertson', 'hunt', 'black', 'daniels', 'palmer', 'mills',
  'nichols', 'grant', 'knight', 'ferguson', 'rose', 'stone', 'hawkins', 'dunn', 'perkins', 'hudson'
];

// ==============================================================================
// 🧹 4. UTILIDAD PARA LIMPIAR TEXTO
// Quita acentos, caracteres especiales, espacios y pasa a minúsculas
// ==============================================================================
export function cleanForEmail(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos: á -> a, é -> e, etc.
    .replace(/ñ/gi, 'n')             // ñ -> n
    .replace(/[^a-zA-Z0-9]/g, '')    // Quita símbolos, guiones y espacios
    .toLowerCase()
    .trim();
}

// ==============================================================================
// 🎲 5. GENERADOR DE CORREO DE RECUPERACIÓN
// Formato: nombre + apellido + numero (00 al 99) + dominio
// ==============================================================================
export function generateRecoveryEmail(
  preferredNombre?: string,
  preferredApellido?: string,
  domain: string = DEFAULT_RECOVERY_DOMAIN
): string {
  let nombreClean = cleanForEmail(preferredNombre || '');
  let apellidoClean = cleanForEmail(preferredApellido || '');

  // Si no se proporcionó nombre o apellido, seleccionar aleatoriamente de la lista
  if (!nombreClean) {
    const randIndex = Math.floor(Math.random() * NOMBRES.length);
    nombreClean = cleanForEmail(NOMBRES[randIndex] || 'usuario');
  }

  if (!apellidoClean) {
    const randIndex = Math.floor(Math.random() * APELLIDOS.length);
    apellidoClean = cleanForEmail(APELLIDOS[randIndex] || 'moshi');
  }

  // Generar número aleatorio del 00 al 99 con 2 dígitos (padStart)
  const randomNum = Math.floor(Math.random() * 100);
  const formattedNum = String(randomNum).padStart(2, '0');

  // Asegurar que el dominio empiece con '@'
  const safeDomain = domain.startsWith('@') ? domain : `@${domain}`;

  return `${nombreClean}${apellidoClean}${formattedNum}${safeDomain}`;
}

/**
 * Genera un correo forzando nombres y apellidos 100% aleatorios de la lista configurable
 */
export function generateRandomRecoveryEmail(domain: string = DEFAULT_RECOVERY_DOMAIN): string {
  return generateRecoveryEmail(undefined, undefined, domain);
}

// ==============================================================================
// 🔑 6. GENERADOR DE CONTRASEÑAS ROBUSTAS PARA GOOGLE
// Cumple con los requisitos de Google: Mayúsculas, Minúsculas, Números y Símbolos
// ==============================================================================
export function generateSecurePassword(length: number = 14): string {
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluimos I y O para evitar confusiones
  const lowerChars = 'abcdefghijkmnpqrstuvwxyz'; // Excluimos l para evitar confusiones
  const numberChars = '23456789';               // Excluimos 0 y 1 para evitar confusiones
  const symbolChars = '@#$!%&*_-';

  const allChars = upperChars + lowerChars + numberChars + symbolChars;

  // Asegurar que tenga al menos uno de cada tipo
  const required = [
    upperChars[Math.floor(Math.random() * upperChars.length)],
    lowerChars[Math.floor(Math.random() * lowerChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    symbolChars[Math.floor(Math.random() * symbolChars.length)],
  ];

  const remainingLength = Math.max(8, length) - required.length;
  const remaining: string[] = [];

  for (let i = 0; i < remainingLength; i++) {
    const randChar = allChars[Math.floor(Math.random() * allChars.length)];
    remaining.push(randChar);
  }

  // Mezclar los caracteres
  const combined = [...required, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}
