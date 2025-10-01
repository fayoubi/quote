const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{3}-\d{4}$/;
  return phoneRegex.test(phone) || /^\d{10}$/.test(phone.replace(/-/g, ''));
};

const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const validateEnrollmentStatus = (status) => {
  const validStatuses = ['draft', 'in_progress', 'submitted', 'approved', 'rejected', 'cancelled'];
  return validStatuses.includes(status);
};

const validateBeneficiaryPercentages = (beneficiaries) => {
  const primaryTotal = beneficiaries
    .filter((b) => b.type === 'primary')
    .reduce((sum, b) => sum + b.percentage, 0);

  const contingentTotal = beneficiaries
    .filter((b) => b.type === 'contingent')
    .reduce((sum, b) => sum + b.percentage, 0);

  return {
    valid: primaryTotal === 100 && (contingentTotal === 0 || contingentTotal === 100),
    primaryTotal,
    contingentTotal,
  };
};

const validateStepData = (stepId, stepData) => {
  // Basic validation - can be extended based on step requirements
  if (!stepId || typeof stepData !== 'object') {
    return { valid: false, error: 'Invalid step ID or data' };
  }

  // Add step-specific validation here
  switch (stepId) {
    case 'customer_info':
      if (!stepData.verified) {
        return { valid: false, error: 'Customer info must be verified' };
      }
      break;
    case 'plan_selection':
      if (!stepData.selected_plan) {
        return { valid: false, error: 'Plan must be selected' };
      }
      break;
    // Add more step validations as needed
  }

  return { valid: true };
};

export {
  validateEmail,
  validatePhone,
  validateUUID,
  validateEnrollmentStatus,
  validateBeneficiaryPercentages,
  validateStepData,
};