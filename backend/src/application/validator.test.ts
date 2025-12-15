import { validateCandidateData } from './validator';

describe('Validator', () => {
  describe('validateCandidateData', () => {
    it('debería validar correctamente un candidato con datos válidos', () => {
      const validCandidate = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Principal 123',
      };

      expect(() => validateCandidateData(validCandidate)).not.toThrow();
    });

    it('debería lanzar error si el firstName es inválido', () => {
      const invalidCandidate = {
        firstName: 'J',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid name');
    });

    it('debería lanzar error si el email es inválido', () => {
      const invalidCandidate = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'email-invalido',
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid email');
    });

    it('debería lanzar error si el teléfono es inválido', () => {
      const invalidCandidate = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '123',
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid phone');
    });

    it('debería validar correctamente educations', () => {
      const candidateWithEducation = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2015-09-01',
            endDate: '2019-06-30',
          },
        ],
      };

      expect(() => validateCandidateData(candidateWithEducation)).not.toThrow();
    });

    it('debería lanzar error si la fecha de educación es inválida', () => {
      const invalidCandidate = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        educations: [
          {
            institution: 'Universidad',
            title: 'Título',
            startDate: 'invalid-date',
          },
        ],
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid date');
    });

    it('debería validar correctamente workExperiences', () => {
      const candidateWithExperience = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        workExperiences: [
          {
            company: 'Tech Company',
            position: 'Developer',
            description: 'Desarrollo de aplicaciones web',
            startDate: '2020-01-01',
            endDate: '2023-12-31',
          },
        ],
      };

      expect(() => validateCandidateData(candidateWithExperience)).not.toThrow();
    });

    it('debería lanzar error si la compañía en workExperience es inválida', () => {
      const invalidCandidate = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        workExperiences: [
          {
            company: '',
            position: 'Developer',
            startDate: '2020-01-01',
          },
        ],
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid company');
    });

    it('debería validar correctamente CV', () => {
      const candidateWithCV = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        cv: {
          filePath: '/uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      };

      expect(() => validateCandidateData(candidateWithCV)).not.toThrow();
    });

    it('debería lanzar error si el CV tiene formato inválido', () => {
      const invalidCandidate = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        cv: {
          filePath: '/uploads/cv.pdf',
        },
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid CV data');
    });

    it('no debería validar campos si el candidato tiene id (edición)', () => {
      const candidateWithId = {
        id: 1,
        firstName: '',
        email: 'invalid-email',
      };

      expect(() => validateCandidateData(candidateWithId)).not.toThrow();
    });
  });
});
