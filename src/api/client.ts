// Re-exporta la instancia axios centralizada de lib/axios
// para que los módulos de api/ de estudiante B funcionen sin cambios
export { default } from '../lib/axios'
export const TOKEN_KEY = 'tropelcare_token'
