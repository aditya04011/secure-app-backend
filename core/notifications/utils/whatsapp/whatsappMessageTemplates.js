/**
 * Returns a formatted WhatsApp message caption based on messageType and params.
 * @param {string} messageType - Type of message (e.g., "taskAssignment", "discountAlert", etc.)
 * @param {object} params - Data used to fill in the placeholders.
 * @returns {string} - The formatted message text.
 */
export const getMessageTemplate = (messageType, params = {}) => {
  let caption = "";

  switch (messageType) {
    // 💸 Discount Alerts
    case "discountAlert":
      caption = `Hello ${params?.ownerUsername},\n\nThe enquiry for admission of ${params?.studentInfo} has received a discount of ${params?.discount}%.\nCreated by: ${params?.createrUsername || "N/A"}\nAssigned to: ${params?.assignedUsername || "N/A"}.`;
      break;

    // 💰 Expense Notifications
    case "expensesNotification":
      if (params?.type === "product_inventory") {
        caption = `Hello ${params?.RecieverUsername},\n\nAn expense of ₹${params?.Amount} was done by ${params?.expensesDoneBy} and approved by ${params?.expenseReportedTo} for purchasing ${params?.productQuantity} ${params?.productName}.`;
      } else if (params?.type === "salary") {
        caption = `Hello ${params?.RecieverUsername},\n\nA salary expense of ₹${params?.Amount} was done by ${params?.expensesDoneBy} and approved by ${params?.expenseReportedTo}, credited to ${params?.salaryCreditedTo}.`;
      } else if (params?.type === "others") {
        caption = `Hello ${params?.RecieverUsername},\n\nAn expense of ₹${params?.Amount} was done by ${params?.expensesDoneBy} and approved by ${params?.expenseReportedTo} for ${params?.customType || "Other Expenses"}.`;
      } else {
        caption = `Hello ${params?.RecieverUsername},\n\nAn expense of ₹${params?.Amount} was done by ${params?.expensesDoneBy} and approved by ${params?.expenseReportedTo} for ${params?.type}.`;
      }
      break;

    // 📦 Inventory Updates
    case "newInventoryNotification":
      caption = `Hello ${params?.ManagerUsername},\n\nA new inventory product has been added: ${params?.productQuantity} ${params?.productName}.\nThis expense of ₹${params?.Amount} was done by ${params?.expensesDoneBy} and approved by ${params?.expenseReportedTo}.`;
      break;

    case "updateInventoryQuantityNotification":
      caption = `Hello ${params?.ManagerUsername},\n\nAn existing inventory product has been updated: ${params?.addedProductQuantity} ${params?.productName} have been added.\nTotal available quantity: ${params?.totalProductQuantity}.\nExpense: ₹${params?.Amount} (Done by ${params?.expensesDoneBy}, Approved by ${params?.expenseReportedTo}).`;
      break;

    // ✅ Task Notifications
    case "taskAssignment":
      caption = `Hello ${params?.assigneeUsername},\n\nYou have a new task assigned by ${params?.createrUsername}.\nCheck it here: ${params?.taskLink}`;
      break;

    case "taskCompleted":
      caption = `Hello ${params?.createrUsername},\n\n${params?.assigneeUsername} has marked the task "${params?.taskTitle}" as completed on ${params?.completionDate}.\nCheck it here: ${params?.taskLink}`;
      break;

    case "taskExtensionRequested":
      caption = `Hi ${params?.createrUsername},\n\n${params?.assigneeUsername} has requested an extension for the task "${params?.taskTitle}" until ${params?.extendDate}.\nCheck it here: ${params?.taskLink}`;
      break;

    case "taskExtensionStatus":
      caption = `Hi ${params?.assigneeUsername},\n\nYour extension request for "${params?.taskTitle}" was ${params?.status}.\nNew Target Date: ${params?.extendDate}.\nCheck it here: ${params?.taskLink}`;
      break;

    // 🧾 Installment Reminders
    case "upcoming_installment":
      caption = `Hello,\n\nThis is a reminder that Installment #${params?.installmentNo} of ₹${params?.amount} is due on ${params?.dueDate}.\nPlease ensure timely payment to avoid late fees.`;
      break;

    case "overdue_installment":
      caption = `Hello,\n\nInstallment #${params?.installmentNo} of ₹${params?.amount} was due on ${params?.dueDate} (${params?.daysOverdue} days ago) and is still pending.\nKindly clear the dues at the earliest.`;
      break;

    // 🎓 Class Schedules
    case "class_schedule_student":
      caption = `Hello ${params?.studentName},\n\nYour class for ${params?.subjectName} is scheduled from ${params?.startTime} to ${params?.endTime}.\nTopics: ${params?.chapters}.\nPlease be on time.`;
      break;

    case "class_schedule_faculty":
      caption = `Hello ${params?.facultyName},\n\nYour class for ${params?.subjectName} is scheduled from ${params?.startTime} to ${params?.endTime}.\nTopics: ${params?.chapters}.\nBatch: ${params?.batchName}.\nPlease prepare accordingly.`;
      break;

    // 🏖 Leave Management
    case "leaveRequest":
      caption = `Hello ${params?.approverName},\n\nA new leave request has been submitted by ${params?.employeeName}.\n📅 From: ${params?.startDate}\n📅 To: ${params?.endDate}\n📝 Reason: ${params?.reason}\n${params?.taskLink}\nPlease review and take action.`;
      break;

    case "leaveStatusUpdate":
      caption = `Hello ${params?.applicantName},\n\nYour leave request has been ${params?.status} by ${params?.approverName}.\n📅 From: ${params?.startDate}\n📅 To: ${params?.endDate}\n📝 Reason: ${params?.reason}\n\nYou can view the details here: ${params?.taskLink}`;
      break;

    // 🧾 Enquiry Notifications
    case "enquiryCreated":
      caption = `Hello ${params?.studentName},\n\nThank you for your interest in our institution! 🎓\nWe've received your enquiry for the academic year ${params?.academicYear}.\n📚 Class: ${params?.standard}\n🏫 Board: ${params?.board}\n\nOur team will reach out to you shortly with more information.`;
      break;

    case "enquirySubmittedToAdmin":
      caption = `Hello Admin,\n\nA new lead has been submitted by parent ${params?.parentName} for student ${params?.studentName}.`;
      break;

    case "enquirySubmittedToParent":
      caption = `Hello ${params?.parentName},\n\nYour enquiry form for ${params?.studentName} has been submitted successfully.\nWe will get back to you soon.`;
      break;

    // 🧩 Default Fallback
    default:
      caption = `Hello ${params?.assigneeUsername || "User"},\n\nYou have a new task update.\nCheck it here: ${params?.taskLink || "N/A"}`;
  }

  // Clean text (remove newlines for WhatsApp template safety)
  return caption.replace(/\r?\n|\r/g, " ").replace(/\s{2,}/g, " ").trim();
};
