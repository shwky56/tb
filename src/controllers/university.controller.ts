import { Request, Response } from 'express';
import { UniversityService } from '../services/university.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';

const universityService = new UniversityService();

export const createUniversity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const universityData = req.body;
    const university = await universityService.createUniversity(universityData);

    return sendSuccess(res, 'University created successfully', { university }, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create university', undefined, 400);
  }
};

export const getUniversityById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId } = req.params;
    const university = await universityService.getUniversityById(universityId);

    return sendSuccess(res, 'University retrieved successfully', { university });
  } catch (error: any) {
    return sendError(res, error.message || 'University not found', undefined, 404);
  }
};

export const updateUniversity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId } = req.params;
    const updates = req.body;

    const university = await universityService.updateUniversity(universityId, updates);

    return sendSuccess(res, 'University updated successfully', { university });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update university', undefined, 400);
  }
};

export const deleteUniversity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { universityId } = req.params;
    await universityService.deleteUniversity(universityId);

    return sendSuccess(res, 'University deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete university', undefined, 400);
  }
};

export const listUniversities = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, location, limit = '20', offset = '0' } = req.query;

    const options = {
      name: name as string | undefined,
      location: location as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const { universities, total } = await universityService.listUniversities(options);

    return sendPaginated(
      res,
      'Universities retrieved successfully',
      universities,
      total,
      options.limit,
      options.offset
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve universities', undefined, 400);
  }
};
