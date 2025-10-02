import enrollmentService from '../services/enrollment.service.js';
import customerService from '../services/customer.service.js';
import billingService from '../services/billing.service.js';
import beneficiaryService from '../services/beneficiary.service.js';
import stepDataService from '../services/stepData.service.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { validateUUID, validateEnrollmentStatus } from '../utils/validators.js';

class EnrollmentController {
  // POST /api/v1/enrollments - Create new enrollment
  createEnrollment = asyncHandler(async (req, res) => {
    const { customer, plan_id, effective_date, metadata } = req.body;

    if (!customer || !plan_id) {
      throw new ApiError(400, 'Customer and plan_id are required');
    }

    // Find or create customer
    const customerRecord = await customerService.findOrCreate(customer);

    // Create enrollment
    const enrollment = await enrollmentService.create(
      {
        customer_id: customerRecord.id,
        plan_id,
        effective_date,
        metadata,
      },
      req.agentId
    );

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  });

  // GET /api/v1/enrollments/:id - Get enrollment details
  getEnrollment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const enrollment = await enrollmentService.getById(id);

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }

    res.json({
      success: true,
      data: enrollment,
    });
  });

  // GET /api/v1/enrollments - List enrollments with filters
  listEnrollments = asyncHandler(async (req, res) => {
    const { agentId, status, customerId, limit, offset } = req.query;

    const filters = {
      agentId: agentId || req.agentId, // Default to authenticated agent
      status,
      customerId,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    };

    const enrollments = await enrollmentService.list(filters);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        count: enrollments.length,
      },
    });
  });

  // PATCH /api/v1/enrollments/:id/status - Update enrollment status
  updateEnrollmentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, metadata } = req.body;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    if (!status || !validateEnrollmentStatus(status)) {
      throw new ApiError(400, 'Valid status is required');
    }

    const enrollment = await enrollmentService.updateStatus(id, status, req.agentId, {
      ...metadata,
      ip_address: req.ipAddress,
      user_agent: req.userAgent,
    });

    res.json({
      success: true,
      data: enrollment,
    });
  });

  // DELETE /api/v1/enrollments/:id - Cancel enrollment
  deleteEnrollment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const enrollment = await enrollmentService.delete(id, req.agentId);

    res.json({
      success: true,
      message: 'Enrollment cancelled successfully',
      data: enrollment,
    });
  });

  // POST /api/v1/enrollments/:id/steps/:stepId - Save step data
  saveStepData = asyncHandler(async (req, res) => {
    const { id, stepId } = req.params;
    const stepData = req.body;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const result = await stepDataService.save(id, stepId, stepData);

    res.json({
      success: true,
      data: result,
    });
  });

  // GET /api/v1/enrollments/:id/steps/:stepId - Get step data
  getStepData = asyncHandler(async (req, res) => {
    const { id, stepId } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const stepData = await stepDataService.get(id, stepId);

    // Return empty data if not found instead of throwing error (for MVP)
    if (!stepData) {
      res.json({
        success: true,
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      data: stepData,
    });
  });

  // GET /api/v1/enrollments/:id/steps - Get all steps
  getAllSteps = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const steps = await stepDataService.getAll(id);

    res.json({
      success: true,
      data: steps,
    });
  });

  // POST /api/v1/enrollments/:id/billing - Save billing data
  saveBillingData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const billingData = req.body;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const result = await billingService.save(id, billingData);

    res.json({
      success: true,
      data: result,
    });
  });

  // GET /api/v1/enrollments/:id/billing - Get billing data (masked)
  getBillingData = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const billingData = await billingService.get(id, true); // Masked by default

    if (!billingData) {
      throw new ApiError(404, 'Billing data not found');
    }

    res.json({
      success: true,
      data: billingData,
    });
  });

  // POST /api/v1/enrollments/:id/beneficiaries - Add beneficiaries
  addBeneficiaries = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { beneficiaries } = req.body;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      throw new ApiError(400, 'Beneficiaries array is required');
    }

    const result = await beneficiaryService.add(id, beneficiaries);

    res.json({
      success: true,
      data: result,
    });
  });

  // GET /api/v1/enrollments/:id/beneficiaries - Get beneficiaries
  getBeneficiaries = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const beneficiaries = await beneficiaryService.get(id);

    res.json({
      success: true,
      data: beneficiaries,
    });
  });

  // PUT /api/v1/enrollments/:id/beneficiaries/:beneficiaryId - Update beneficiary
  updateBeneficiary = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;
    const beneficiaryData = req.body;

    if (!validateUUID(beneficiaryId)) {
      throw new ApiError(400, 'Invalid beneficiary ID');
    }

    const result = await beneficiaryService.update(beneficiaryId, beneficiaryData);

    res.json({
      success: true,
      data: result,
    });
  });

  // DELETE /api/v1/enrollments/:id/beneficiaries/:beneficiaryId - Remove beneficiary
  deleteBeneficiary = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;

    if (!validateUUID(beneficiaryId)) {
      throw new ApiError(400, 'Invalid beneficiary ID');
    }

    const result = await beneficiaryService.delete(beneficiaryId);

    res.json({
      success: true,
      message: 'Beneficiary removed successfully',
      data: result,
    });
  });

  // GET /api/v1/enrollments/:id/summary - Get complete enrollment summary
  getEnrollmentSummary = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const summary = await enrollmentService.getSummary(id);

    res.json({
      success: true,
      data: summary,
    });
  });

  // POST /api/v1/enrollments/:id/submit - Submit enrollment for processing
  submitEnrollment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
      throw new ApiError(400, 'Invalid enrollment ID');
    }

    const enrollment = await enrollmentService.submit(id, req.agentId);

    res.json({
      success: true,
      message: 'Enrollment submitted successfully',
      data: enrollment,
    });
  });
}

export default new EnrollmentController();