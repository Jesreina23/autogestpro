/**
 * Utilidades para la generacion automatica de nombres de usuario y contraseñas.
 * Sigue la regla corporativa: inicial del primer nombre + primer apellido (ej. cgomez).
 * En caso de colision, avanza a iniciales compuestas (ej. cagomez) o desambiguacion.
 */

/**
 * Limpia y normaliza una cadena de texto (sin acentos, en minusculas, solo letras y numeros).
 */
export function limpiarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Genera la lista ordenada de candidatos a nombre de usuario segun el nombre completo.
 * Ejemplo: "Carlos Alberto Gomez Ruiz"
 * - Candidato 1: "cgomez" (1er nombre + 1er apellido)
 * - Candidato 2: "cagomez" (1er nombre + 2do nombre + 1er apellido)
 * - Candidato 3: "cgomezr" (1er nombre + 1er apellido + 2do apellido)
 * - Candidato 4: "carlos.gomez"
 * - Fallbacks: "cgomez1", "cgomez2", etc.
 */
export function generarCandidatosUsername(nombreCompleto: string): string[] {
  const palabras = nombreCompleto
    .trim()
    .split(/\s+/)
    .map(limpiarTexto)
    .filter((p) => p.length > 0);

  if (palabras.length === 0) return ["cliente"];
  if (palabras.length === 1) return [palabras[0], `${palabras[0]}1`, `${palabras[0]}2`];

  const candidatos: string[] = [];

  // 2 palabras: [Nombre, Apellido]
  if (palabras.length === 2) {
    const [nombre, apellido] = palabras;
    candidatos.push(`${nombre.charAt(0)}${apellido}`); // e.g. cgomez
    candidatos.push(`${nombre}.${apellido}`); // e.g. carlos.gomez
    candidatos.push(`${nombre}${apellido.charAt(0)}`); // e.g. carlosg
    for (let i = 1; i <= 5; i++) {
      candidatos.push(`${nombre.charAt(0)}${apellido}${i}`); // e.g. cgomez1
    }
    return Array.from(new Set(candidatos));
  }

  // 3 palabras: [Nombre1, Apellido1, Apellido2] o [Nombre1, Nombre2, Apellido1]
  if (palabras.length === 3) {
    const [p1, p2, p3] = palabras;
    // Opcion A habitual: p1 = Nombre, p2 = Apellido1, p3 = Apellido2
    candidatos.push(`${p1.charAt(0)}${p2}`); // cgomez
    candidatos.push(`${p1.charAt(0)}${p2}${p3.charAt(0)}`); // cgomezr
    candidatos.push(`${p1.charAt(0)}${p2.charAt(0)}${p3}`); // cagomez (si p2 fuera 2do nombre)
    candidatos.push(`${p1}.${p2}`); // carlos.gomez
    for (let i = 1; i <= 5; i++) {
      candidatos.push(`${p1.charAt(0)}${p2}${i}`);
    }
    return Array.from(new Set(candidatos));
  }

  // 4 o mas palabras: [Nombre1, Nombre2, Apellido1, Apellido2...]
  const n1 = palabras[0];
  const n2 = palabras[1];
  const a1 = palabras[2];
  const a2 = palabras[3];

  candidatos.push(`${n1.charAt(0)}${a1}`); // cgomez
  candidatos.push(`${n1.charAt(0)}${n2.charAt(0)}${a1}`); // cagomez
  candidatos.push(`${n1.charAt(0)}${a1}${a2 ? a2.charAt(0) : ""}`); // cgomezr
  candidatos.push(`${n1}.${a1}`); // carlos.gomez
  candidatos.push(`${n1.charAt(0)}${n2.charAt(0)}${a1}${a2 ? a2.charAt(0) : ""}`); // cagomezr

  for (let i = 1; i <= 9; i++) {
    candidatos.push(`${n1.charAt(0)}${a1}${i}`); // cgomez1, cgomez2...
  }

  return Array.from(new Set(candidatos));
}

/**
 * Genera una contraseña inicial sugerida basada en el documento de identidad del cliente
 * o una clave amigable estándar.
 */
export function generarClaveInicial(documentoIdentidad?: string | null): string {
  if (!documentoIdentidad) {
    return "AutoGest2026*";
  }

  // Extraer digitos del documento (ej. "V-28.123.456" -> "28123456")
  const digitos = documentoIdentidad.replace(/\D/g, "");

  if (digitos.length >= 4) {
    // Tomar los ultimos 4 digitos
    const ultimos4 = digitos.slice(-4);
    return `cli${ultimos4}`;
  }

  return "AutoGest2026*";
}
