import { Request, Response } from 'express';
import { FacultyService } from '../services/faculty.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';

const facultyService = new FacultyService();

export const createFaculty = async (req: Request, res: Response): Promise<Response> => {
  try {
    const facultyData = req.body;
    const faculty = await facultyService.createFaculty(facultyData);

    return sendSuccess(res, 'Faculty created successfully', { faculty }, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create faculty', undefined, 400);
  }
};

export const getFacultyById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { facultyId } = req.params;
    const faculty = await facultyService.getFacultyById(facultyId);

    return sendSuccess(res, 'Faculty retrieved successfully', { faculty });
  } catch (error: any) {
    return sendError(res, error.message || 'Faculty not found', undefined, 404);
  }
};

export const updateFaculty = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { facultyId } = req.params;
    const updates = req.body;

    const faculty = await facultyService.updateFaculty(facultyId, updates);

    return sendSuccess(res, 'Faculty updated successfully', { faculty });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update faculty', undefined, 400);
  }
};

export const deleteFaculty = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { facultyId } = req.params;
    await facultyService.deleteFaculty(facultyId);

    return sendSuccess(res, 'Faculty deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete faculty', undefined, 400);
  }
};

export const listFaculties = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId, name, limit = '20', offset = '0' } = req.query;

    const options = {
      universityId: universityId as string | undefined,
      name: name as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const { faculties, total } = await facultyService.listFaculties(options);

    return sendPaginated(
      res,
      'Faculties retrieved successfully',
      faculties,
      total,
      options.limit,
      options.offset
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve faculties', undefined, 400);
  }
};

export const getFacultiesByUniversity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId } = req.params;
    const faculties = await facultyService.getFacultiesByUniversity(universityId);

    return sendSuccess(res, 'Faculties retrieved successfully', { faculties });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve faculties', undefined, 400);
  }
};
