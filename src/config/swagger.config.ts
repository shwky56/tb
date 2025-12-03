import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS API Documentation',
      version: '1.0.0',
      description: 'Learning Management System API with authentication, courses, and enrollment management',
      contact: {
        name: 'API Support',
        email: 'support@lms.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.lms.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: {
              type: 'string',
              example: 'John Smith',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            role: {
              type: 'string',
              enum: ['Student', 'Instructor', 'University-admin', 'Super-admin'],
              example: 'Student',
            },
            university: {
              type: 'string',
              example: 'Harvard University',
              nullable: true,
            },
            phoneNumber: {
              type: 'string',
              example: '+1 (555) 123-4567',
              nullable: true,
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1990-05-15',
              nullable: true,
            },
            address: {
              type: 'string',
              example: '123 Main Street, Apt 4B',
              nullable: true,
            },
            city: {
              type: 'string',
              example: 'New York',
              nullable: true,
            },
            country: {
              type: 'string',
              example: 'United States',
              nullable: true,
            },
            bio: {
              type: 'string',
              example: 'Software developer passionate about education technology',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['Active', 'Pending', 'Banned'],
              example: 'Active',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Course: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              example: 'Introduction to TypeScript',
            },
            description: {
              type: 'string',
              example: 'Learn TypeScript from basics to advanced',
            },
            instructorId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Published', 'Archived'],
              example: 'Published',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            studentId: {
              type: 'string',
              format: 'uuid',
            },
            courseId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['Active', 'Completed', 'Dropped'],
              example: 'Active',
            },
            enrolledAt: {
              type: 'string',
              format: 'date-time',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
        University: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Cairo University',
            },
            location: {
              type: 'string',
              example: 'Cairo, Egypt',
              nullable: true,
            },
            establishedYear: {
              type: 'integer',
              example: 1908,
              nullable: true,
            },
            description: {
              type: 'string',
              example: 'The premier public university in Egypt',
              nullable: true,
            },
            image: {
              type: 'string',
              example: 'https://example.com/images/cairo-university.jpg',
              nullable: true,
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Faculty: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '987e6543-e21b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Faculty of Engineering',
            },
            universityId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            dean: {
              type: 'string',
              example: 'Dr. Ahmed Hassan',
              nullable: true,
            },
            establishedYear: {
              type: 'integer',
              example: 1925,
              nullable: true,
            },
            image: {
              type: 'string',
              example: 'https://example.com/images/engineering-faculty.jpg',
              nullable: true,
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            university: {
              $ref: '#/components/schemas/University',
            },
            academicLevels: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AcademicLevel',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AcademicLevel: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '456e7890-e12b-34d5-a678-901234567890',
            },
            name: {
              type: 'string',
              example: 'First Year',
            },
            order: {
              type: 'integer',
              example: 1,
            },
            universityId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            facultyId: {
              type: 'string',
              format: 'uuid',
              example: '987e6543-e21b-12d3-a456-426614174000',
            },
            duration: {
              type: 'integer',
              example: 2,
              nullable: true,
              description: 'Duration in semesters or years',
            },
            requiredCredits: {
              type: 'integer',
              example: 36,
              nullable: true,
            },
            description: {
              type: 'string',
              example: 'Foundation year covering basic subjects',
              nullable: true,
            },
            isDeleted: {
              type: 'boolean',
              example: false,
            },
            university: {
              $ref: '#/components/schemas/University',
            },
            faculty: {
              $ref: '#/components/schemas/Faculty',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Unauthorized',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Forbidden: Insufficient permissions',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Resource not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: [
                  {
                    field: 'email',
                    message: 'Invalid email format',
                  },
                ],
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Courses',
        description: 'Course management endpoints',
      },
      {
        name: 'Enrollments',
        description: 'Enrollment management endpoints',
      },
      {
        name: 'Universities',
        description: 'University management endpoints',
      },
      {
        name: 'Faculties',
        description: 'Faculty management endpoints',
      },
      {
        name: 'Academic Levels',
        description: 'Academic level management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
