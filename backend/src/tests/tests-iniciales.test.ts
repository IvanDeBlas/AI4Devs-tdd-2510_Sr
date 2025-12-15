import { addCandidate } from '../application/services/candidateService';
import { PrismaClient } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    candidate: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    education: {
      create: jest.fn(),
    },
    workExperience: {
      create: jest.fn(),
    },
    resume: {
      create: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'PrismaClientInitializationError';
        }
      },
    },
  };
});

describe('Tests de inserción de candidatos', () => {
  let prisma: any;

  beforeEach(() => {
    // Resetear los mocks antes de cada test
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });

  // ===========================================
  // FAMILIA 1: RECEPCIÓN DE DATOS DEL FORMULARIO
  // ===========================================

  describe('Recepción y validación de datos del formulario', () => {
    it('debería aceptar y procesar datos válidos de un candidato básico', async () => {
      // Arrange
      const candidatoValido = {
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Mayor 123, Madrid',
      };

      prisma.candidate.create.mockResolvedValue({
        id: 1,
        ...candidatoValido,
      });

      // Act
      const resultado = await addCandidate(candidatoValido);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(1);
      expect(resultado.email).toBe(candidatoValido.email);
    });

    it('debería rechazar datos con firstName inválido (muy corto)', async () => {
      // Arrange
      const candidatoInvalido = {
        firstName: 'J', // Menos de 2 caracteres
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
      };

      // Act & Assert
      await expect(addCandidate(candidatoInvalido)).rejects.toThrow('Invalid name');
    });

    it('debería rechazar datos con email inválido', async () => {
      // Arrange
      const candidatoInvalido = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'email-sin-formato-valido', // Email inválido
      };

      // Act & Assert
      await expect(addCandidate(candidatoInvalido)).rejects.toThrow('Invalid email');
    });

    it('debería rechazar datos con teléfono inválido', async () => {
      // Arrange
      const candidatoInvalido = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '123', // Teléfono no cumple el formato español
      };

      // Act & Assert
      await expect(addCandidate(candidatoInvalido)).rejects.toThrow('Invalid phone');
    });

    it('debería validar correctamente educations en el formulario', async () => {
      // Arrange
      const candidatoConEducacion = {
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        educations: [
          {
            institution: 'Universidad Complutense de Madrid',
            title: 'Grado en Ingeniería Informática',
            startDate: '2015-09-01',
            endDate: '2019-06-30',
          },
        ],
      };

      prisma.candidate.create.mockResolvedValue({
        id: 2,
        firstName: candidatoConEducacion.firstName,
        lastName: candidatoConEducacion.lastName,
        email: candidatoConEducacion.email,
      });

      prisma.education.create.mockResolvedValue({
        id: 1,
        candidateId: 2,
        ...candidatoConEducacion.educations[0],
      });

      // Act
      const resultado = await addCandidate(candidatoConEducacion);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(2);
    });

    it('debería rechazar educations con fechas inválidas', async () => {
      // Arrange
      const candidatoInvalido = {
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@example.com',
        educations: [
          {
            institution: 'Universidad de Barcelona',
            title: 'Grado en Medicina',
            startDate: 'fecha-invalida', // Formato incorrecto
          },
        ],
      };

      // Act & Assert
      await expect(addCandidate(candidatoInvalido)).rejects.toThrow('Invalid date');
    });

    it('debería validar correctamente workExperiences en el formulario', async () => {
      // Arrange
      const candidatoConExperiencia = {
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@example.com',
        workExperiences: [
          {
            company: 'Tech Solutions S.L.',
            position: 'Senior Developer',
            description: 'Desarrollo de aplicaciones web con React y Node.js',
            startDate: '2020-01-15',
            endDate: '2023-12-31',
          },
        ],
      };

      prisma.candidate.create.mockResolvedValue({
        id: 3,
        firstName: candidatoConExperiencia.firstName,
        lastName: candidatoConExperiencia.lastName,
        email: candidatoConExperiencia.email,
      });

      prisma.workExperience.create.mockResolvedValue({
        id: 1,
        candidateId: 3,
        ...candidatoConExperiencia.workExperiences[0],
      });

      // Act
      const resultado = await addCandidate(candidatoConExperiencia);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(3);
    });

    it('debería rechazar workExperiences con company vacío', async () => {
      // Arrange
      const candidatoInvalido = {
        firstName: 'Pedro',
        lastName: 'Sánchez',
        email: 'pedro.sanchez@example.com',
        workExperiences: [
          {
            company: '', // Company vacío (inválido)
            position: 'Developer',
            startDate: '2020-01-01',
          },
        ],
      };

      // Act & Assert
      await expect(addCandidate(candidatoInvalido)).rejects.toThrow('Invalid company');
    });
  });

  // ===========================================
  // FAMILIA 2: GUARDADO EN BASE DE DATOS
  // ===========================================

  describe('Guardado en base de datos', () => {
    it('debería guardar correctamente un candidato básico en la BD', async () => {
      // Arrange
      const candidatoBasico = {
        firstName: 'Laura',
        lastName: 'Fernández',
        email: 'laura.fernandez@example.com',
        phone: '687654321',
        address: 'Avenida Diagonal 456, Barcelona',
      };

      const candidatoGuardado = {
        id: 10,
        ...candidatoBasico,
      };

      prisma.candidate.create.mockResolvedValue(candidatoGuardado);

      // Act
      const resultado = await addCandidate(candidatoBasico);

      // Assert
      expect(prisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(prisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: candidatoBasico.firstName,
          lastName: candidatoBasico.lastName,
          email: candidatoBasico.email,
          phone: candidatoBasico.phone,
          address: candidatoBasico.address,
        }),
      });
      expect(resultado.id).toBe(10);
    });

    it('debería guardar un candidato con educations en la BD', async () => {
      // Arrange
      const candidatoConEducacion = {
        firstName: 'Roberto',
        lastName: 'Díaz',
        email: 'roberto.diaz@example.com',
        educations: [
          {
            institution: 'Universidad Politécnica de Valencia',
            title: 'Máster en Ciberseguridad',
            startDate: '2021-09-01',
            endDate: '2023-06-30',
          },
        ],
      };

      prisma.candidate.create.mockResolvedValue({
        id: 11,
        firstName: candidatoConEducacion.firstName,
        lastName: candidatoConEducacion.lastName,
        email: candidatoConEducacion.email,
      });

      prisma.education.create.mockResolvedValue({
        id: 5,
        candidateId: 11,
        institution: candidatoConEducacion.educations[0].institution,
        title: candidatoConEducacion.educations[0].title,
        startDate: new Date(candidatoConEducacion.educations[0].startDate),
        endDate: new Date(candidatoConEducacion.educations[0].endDate),
      });

      // Act
      const resultado = await addCandidate(candidatoConEducacion);

      // Assert
      expect(prisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(prisma.education.create).toHaveBeenCalledTimes(1);
      expect(prisma.education.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 11,
          institution: candidatoConEducacion.educations[0].institution,
          title: candidatoConEducacion.educations[0].title,
        }),
      });
      expect(resultado.id).toBe(11);
    });

    it('debería guardar un candidato con workExperiences en la BD', async () => {
      // Arrange
      const candidatoConExperiencia = {
        firstName: 'Elena',
        lastName: 'Torres',
        email: 'elena.torres@example.com',
        workExperiences: [
          {
            company: 'Global Tech Corp',
            position: 'Tech Lead',
            description: 'Liderazgo de equipo de 5 desarrolladores',
            startDate: '2019-03-01',
            endDate: '2024-01-31',
          },
        ],
      };

      prisma.candidate.create.mockResolvedValue({
        id: 12,
        firstName: candidatoConExperiencia.firstName,
        lastName: candidatoConExperiencia.lastName,
        email: candidatoConExperiencia.email,
      });

      prisma.workExperience.create.mockResolvedValue({
        id: 8,
        candidateId: 12,
        company: candidatoConExperiencia.workExperiences[0].company,
        position: candidatoConExperiencia.workExperiences[0].position,
        description: candidatoConExperiencia.workExperiences[0].description,
        startDate: new Date(candidatoConExperiencia.workExperiences[0].startDate),
        endDate: new Date(candidatoConExperiencia.workExperiences[0].endDate),
      });

      // Act
      const resultado = await addCandidate(candidatoConExperiencia);

      // Assert
      expect(prisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(prisma.workExperience.create).toHaveBeenCalledTimes(1);
      expect(prisma.workExperience.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 12,
          company: candidatoConExperiencia.workExperiences[0].company,
          position: candidatoConExperiencia.workExperiences[0].position,
        }),
      });
      expect(resultado.id).toBe(12);
    });

    it('debería guardar un candidato con CV en la BD', async () => {
      // Arrange
      const candidatoConCV = {
        firstName: 'Miguel',
        lastName: 'Ruiz',
        email: 'miguel.ruiz@example.com',
        cv: {
          filePath: 'uploads/1234567890-cv-miguel-ruiz.pdf',
          fileType: 'application/pdf',
        },
      };

      prisma.candidate.create.mockResolvedValue({
        id: 13,
        firstName: candidatoConCV.firstName,
        lastName: candidatoConCV.lastName,
        email: candidatoConCV.email,
      });

      prisma.resume.create.mockResolvedValue({
        id: 3,
        candidateId: 13,
        filePath: candidatoConCV.cv.filePath,
        fileType: candidatoConCV.cv.fileType,
        uploadDate: new Date(),
      });

      // Act
      const resultado = await addCandidate(candidatoConCV);

      // Assert
      expect(prisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(prisma.resume.create).toHaveBeenCalledTimes(1);
      expect(prisma.resume.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 13,
          filePath: candidatoConCV.cv.filePath,
          fileType: candidatoConCV.cv.fileType,
        }),
      });
      expect(resultado.id).toBe(13);
    });

    it('debería manejar correctamente el error de email duplicado en BD', async () => {
      // Arrange
      const candidatoDuplicado = {
        firstName: 'Isabel',
        lastName: 'Moreno',
        email: 'isabel.moreno@example.com',
      };

      // Simular error de Prisma para unique constraint
      const prismaError: any = new Error('Unique constraint failed');
      prismaError.code = 'P2002';
      prisma.candidate.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(addCandidate(candidatoDuplicado)).rejects.toThrow(
        'The email already exists in the database'
      );
    });

    it('debería guardar un candidato completo con todas las relaciones en la BD', async () => {
      // Arrange
      const candidatoCompleto = {
        firstName: 'Alejandro',
        lastName: 'Navarro',
        email: 'alejandro.navarro@example.com',
        phone: '654321098',
        address: 'Plaza España 10, Sevilla',
        educations: [
          {
            institution: 'Universidad de Sevilla',
            title: 'Grado en Administración de Empresas',
            startDate: '2014-09-01',
            endDate: '2018-06-30',
          },
          {
            institution: 'ESADE Business School',
            title: 'MBA',
            startDate: '2019-09-01',
            endDate: '2021-06-30',
          },
        ],
        workExperiences: [
          {
            company: 'Consulting Partners',
            position: 'Junior Consultant',
            description: 'Consultoría estratégica para empresas del sector financiero',
            startDate: '2018-07-01',
            endDate: '2019-08-31',
          },
          {
            company: 'Innovation Hub',
            position: 'Senior Consultant',
            description: 'Gestión de proyectos de transformación digital',
            startDate: '2021-09-01',
            endDate: '2024-02-29',
          },
        ],
        cv: {
          filePath: 'uploads/9876543210-cv-alejandro-navarro.pdf',
          fileType: 'application/pdf',
        },
      };

      prisma.candidate.create.mockResolvedValue({
        id: 20,
        firstName: candidatoCompleto.firstName,
        lastName: candidatoCompleto.lastName,
        email: candidatoCompleto.email,
        phone: candidatoCompleto.phone,
        address: candidatoCompleto.address,
      });

      prisma.education.create
        .mockResolvedValueOnce({
          id: 10,
          candidateId: 20,
          ...candidatoCompleto.educations[0],
        })
        .mockResolvedValueOnce({
          id: 11,
          candidateId: 20,
          ...candidatoCompleto.educations[1],
        });

      prisma.workExperience.create
        .mockResolvedValueOnce({
          id: 15,
          candidateId: 20,
          ...candidatoCompleto.workExperiences[0],
        })
        .mockResolvedValueOnce({
          id: 16,
          candidateId: 20,
          ...candidatoCompleto.workExperiences[1],
        });

      prisma.resume.create.mockResolvedValue({
        id: 7,
        candidateId: 20,
        filePath: candidatoCompleto.cv.filePath,
        fileType: candidatoCompleto.cv.fileType,
        uploadDate: new Date(),
      });

      // Act
      const resultado = await addCandidate(candidatoCompleto);

      // Assert
      expect(prisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(prisma.education.create).toHaveBeenCalledTimes(2);
      expect(prisma.workExperience.create).toHaveBeenCalledTimes(2);
      expect(prisma.resume.create).toHaveBeenCalledTimes(1);
      expect(resultado.id).toBe(20);
      expect(resultado.email).toBe(candidatoCompleto.email);
    });
  });
});
