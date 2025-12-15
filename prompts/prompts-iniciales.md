# Prompts Iniciales - Tests Unitarios de Inserción de Candidatos

Este documento contiene los prompts utilizados para generar la suite de tests unitarios de inserción de candidatos con ayuda de IA (GitHub Copilot, Cursor, Claude Code, etc.).

## Contexto del Proyecto

Sistema de seguimiento de candidatos (ATS) desarrollado con:
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Base de datos: PostgreSQL
- Testing: Jest + ts-jest

## Prompt 1: Análisis del Flujo de Inserción

```
Analiza el flujo completo de inserción de candidatos en este proyecto.

Revisa los siguientes archivos:
- backend/src/application/services/candidateService.ts
- backend/src/presentation/controllers/candidateController.ts
- backend/src/domain/models/Candidate.ts
- backend/src/domain/models/Education.ts
- backend/src/domain/models/WorkExperience.ts
- backend/src/domain/models/Resume.ts
- backend/src/application/validator.ts

Identifica:
1. Los puntos de entrada de datos
2. Las validaciones que se aplican
3. Cómo se guardan los datos en la base de datos
4. Las relaciones entre entidades
5. Los posibles errores que pueden ocurrir
```

## Prompt 2: Configuración de Mocks para Prisma

```
Necesito crear mocks de PrismaClient para tests unitarios que NO toquen la base de datos real.

Requisitos:
- Mockear los métodos: create, update, findUnique
- Mockear para las entidades: candidate, education, workExperience, resume
- Incluir mock del error PrismaClientInitializationError
- Incluir mock del error P2002 (unique constraint)
- Usar Jest como framework de testing

Proporciona una configuración de mock completa y reutilizable.
```

## Prompt 3: Tests de Validación de Datos (Familia 1)

```
Crea una suite de tests unitarios para validar la recepción de datos del formulario de candidatos.

Contexto:
- La función validateCandidateData() valida los datos antes de guardarlos
- Los candidatos tienen: firstName, lastName, email, phone, address
- Pueden tener múltiples educations y workExperiences
- Pueden tener un CV

Casos a testear:
1. Datos válidos de un candidato básico (solo campos requeridos)
2. firstName inválido (muy corto, menos de 2 caracteres)
3. lastName inválido (caracteres no permitidos)
4. Email inválido (formato incorrecto)
5. Teléfono inválido (no cumple formato español)
6. Educations válidas con institución, título y fechas
7. Educations con fechas en formato incorrecto
8. WorkExperiences válidas con company, position y fechas
9. WorkExperiences con company vacío (inválido)
10. CV válido con filePath y fileType

Requisitos:
- Usar patrón AAA (Arrange, Act, Assert)
- Nombres descriptivos en español
- Usar expect().rejects.toThrow() para casos de error
- Agrupar con describe() por funcionalidad
```

## Prompt 4: Tests de Guardado en Base de Datos (Familia 2)

```
Crea una suite de tests unitarios para verificar el guardado correcto en base de datos usando mocks de Prisma.

Contexto:
- La función addCandidate() orquesta el guardado de candidato y sus relaciones
- Primero guarda el candidato, luego educations, workExperiences y resume
- Cada entidad relacionada necesita el candidateId del candidato guardado

Casos a testear:
1. Guardar candidato básico (verificar que se llama a prisma.candidate.create)
2. Guardar candidato con educations (verificar múltiples llamadas)
3. Guardar candidato con workExperiences (verificar múltiples llamadas)
4. Guardar candidato con CV/resume
5. Manejar error de email duplicado (código P2002 de Prisma)
6. Guardar candidato completo con TODAS las relaciones (2 educations + 2 workExperiences + CV)

Requisitos:
- Usar mocks configurados previamente para PrismaClient
- Verificar que se llaman los métodos correctos con toHaveBeenCalledTimes()
- Verificar los parámetros pasados con toHaveBeenCalledWith()
- Usar expect.objectContaining() para verificar estructura de datos
- Mockear respuestas realistas con IDs generados
- Para el test completo, usar mockResolvedValueOnce() para múltiples llamadas
```

## Prompt 5: Estructura y Organización

```
Organiza todos los tests creados en un único archivo tests-iniciales.test.ts siguiendo estas buenas prácticas:

Estructura:
- Importar dependencias necesarias
- Configurar mocks de Prisma al inicio
- Usar beforeEach() para resetear mocks entre tests
- Dividir en dos describe() principales:
  * "Recepción y validación de datos del formulario"
  * "Guardado en base de datos"

Buenas prácticas:
- Nombres de tests descriptivos que expliquen QUÉ se testea
- Comentarios AAA (Arrange, Act, Assert) en cada test
- Datos de prueba realistas (nombres españoles, emails válidos, etc.)
- Verificaciones completas con múltiples expects cuando sea necesario
- Manejo apropiado de promesas con async/await

Ubicación del archivo:
backend/src/tests/tests-iniciales.test.ts
```

## Prompt 6: Verificación y Ajustes

```
Revisa la suite de tests creada y verifica:

1. Cobertura: ¿Se cubren ambas familias de tests solicitadas?
2. Calidad: ¿Los tests son independientes entre sí?
3. Realismo: ¿Los datos de prueba son realistas?
4. Claridad: ¿Los nombres y comentarios son claros?
5. Mocks: ¿Los mocks están bien configurados y se resetean correctamente?

Ejecuta: npm test -- tests-iniciales.test.ts

Si hay errores:
- Analiza el stack trace
- Identifica si es un problema de configuración de mocks
- Identifica si es un problema de importaciones
- Identifica si es un problema de async/await
- Proporciona la solución específica
```

## Prompt 7: Documentación

```
Crea un archivo prompts-iniciales.md en la carpeta prompts/ que documente:

1. El contexto del proyecto
2. Los prompts utilizados para generar los tests
3. Las decisiones de diseño tomadas
4. Cómo ejecutar los tests
5. Cómo extender la suite en el futuro

Formato: Markdown con ejemplos de código y explicaciones claras.
```

## Notas sobre el Proceso

### Decisiones de Diseño

1. **Uso de Mocks**: Se decidió mockear completamente PrismaClient para evitar dependencias de la BD real en tests unitarios. Esto hace los tests más rápidos, predecibles y seguros.

2. **Estructura de Tests**: Se dividieron en dos familias claras (validación y guardado) para facilitar el mantenimiento y comprensión.

3. **Datos Realistas**: Se utilizaron datos en español (nombres, direcciones) para que sean más naturales y fáciles de entender en el contexto del proyecto.

4. **Patrón AAA**: Todos los tests siguen el patrón Arrange-Act-Assert con comentarios explícitos para mejorar la legibilidad.

5. **Test Completo**: Se incluyó un test que verifica el guardado de un candidato con TODAS las relaciones para asegurar que el flujo completo funciona.

### Cómo Ejecutar los Tests

```bash
# Ejecutar todos los tests
cd backend
npm test

# Ejecutar solo estos tests
npm test -- tests-iniciales.test.ts

# Ejecutar con coverage
npm test -- --coverage tests-iniciales.test.ts

# Ejecutar en modo watch
npm test -- --watch tests-iniciales.test.ts
```

### Resultados Esperados

```
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
- 8 tests de validación de datos
- 6 tests de guardado en BD
```

### Cómo Extender la Suite

Para añadir más tests:

1. **Tests de actualización**: Crear tests para el flujo de edición de candidatos
2. **Tests de consulta**: Crear tests para buscar y filtrar candidatos
3. **Tests de eliminación**: Crear tests para borrado y sus validaciones
4. **Tests de validaciones complejas**: Validaciones de fechas coherentes, límites de registros, etc.
5. **Tests de integración**: Después de los unitarios, crear tests de integración con BD real de pruebas

### Buenas Prácticas Aplicadas

✅ **Aislamiento**: Cada test es independiente y no depende de otros
✅ **Mocks**: Se usan mocks para eliminar dependencias externas
✅ **AAA Pattern**: Estructura clara Arrange-Act-Assert
✅ **Nombres Descriptivos**: Los nombres de tests explican qué se verifica
✅ **DRY**: Se usa beforeEach() para evitar repetición de código
✅ **Cobertura**: Se cubren casos positivos y negativos
✅ **Realismo**: Datos de prueba cercanos a casos reales
✅ **Documentación**: Código auto-documentado con comentarios claros

### Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing with Prisma](https://www.prisma.io/docs/guides/testing/unit-testing)
- [Prisma Mock Guide](https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client)
- [Testing Best Practices](https://testingjavascript.com/)
