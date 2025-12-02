import { Request, Response } from 'express';
import { AcademicLevelService } from '../services/academic-level.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';

const academicLevelService = new AcademicLevelService();

export const createAcademicLevel = async (req: Request, res: Response): Promise<Response> => {
  try {
    const levelData = req.body;
    const level = await academicLevelService.createAcademicLevel(levelData);

    return sendSuccess(res, 'Academic level created successfully', { level }, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create academic level', undefined, 400);
  }
};

export const getAcademicLevelById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { levelId } = req.params;
    const level = await academicLevelService.getAcademicLevelById(levelId);

    return sendSuccess(res, 'Academic level retrieved successfully', { level });
  } catch (error: any) {
    return sendError(res, error.message || 'Academic level not found', undefined, 404);
  }
};

export const updateAcademicLevel = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { levelId } = req.params;
    const updates = req.body;

    const level = await academicLevelService.updateAcademicLevel(levelId, updates);

    return sendSuccess(res, 'Academic level updated successfully', { level });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update academic level', undefined, 400);
  }
};

export const deleteAcademicLevel = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { levelId } = req.params;
    await academicLevelService.deleteAcademicLevel(levelId);

    return sendSuccess(res, 'Academic level deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete academic level', undefined, 400);
  }
};

export const listAcademicLevels = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId, facultyId, name, limit = '20', offset = '0' } = req.query;

    const options = {
      universityId: universityId as string | undefined,
      facultyId: facultyId as string | undefined,
      name: name as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const { academicLevels, total } = await academicLevelService.listAcademicLevels(options);

    return sendPaginated(
      res,
      'Academic levels retrieved successfully',
      academicLevels,
      total,
      options.limit,
      options.offset
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve academic levels', undefined, 400);
  }
};

export const getAcademicLevelsByFaculty = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { facultyId } = req.params;
    const levels = await academicLevelService.getAcademicLevelsByFaculty(facultyId);

    return sendSuccess(res, 'Academic levels retrieved successfully', { levels });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve academic levels', undefined, 400);
  }
};

export const getAcademicLevelsByUniversity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId } = req.params;
    const levels = await academicLevelService.getAcademicLevelsByUniversity(universityId);

    return sendSuccess(res, 'Academic levels retrieved successfully', { levels });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve academic levels', undefined, 400);
  }
};
