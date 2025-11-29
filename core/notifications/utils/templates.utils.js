const whatsappTemplates = {
  userRegistration: (username, email, password) =>
    `*Dear ${username},*\n\nThank you for registering with us at *Innovative Study Circle*! \n\nWe are excited to have you join us.\n\nHere are your login credentials:\n📧 *Email:* ${email}\n🔑 *Password:* ${password}\n\nFor more details, please visit our website: https://isc.guru\n\n*Warm regards,*\n_The Innovative Study Circle Team_`,

  taskAssignment: (username, title, creator, assigneesList, targetDate) =>
    `✨ *Hello ${username},* ✨\n\n` +
    `📢 *Greetings from Innovative Study Circle!* 📢\n\n` +
    `✅ *A new task has been assigned to you!* ✅\n\n` +
    `📌 *Task Title:* *${title}* \n` +
    `👤 *Assigned By:* ${creator} \n` +
    `🎯 *Assigned To:* ${assigneesList} \n` +
    `📅 *Target Date:* ${targetDate} \n\n` +
    `🔗 *Please log in to your account to view the task details.*\n\n` +
    `💡 *Need help? Feel free to reach out!* \n\n` +
    `*Warm regards,*\n` +
    `_The Innovative Study Circle Team_ 💼`,
    projectTaskAssignment: (username, title, creator, targetDate) =>
      `✨ *Hello ${username},* ✨\n\n` +
      `📢 *Greetings from Innovative Study Circle!* 📢\n\n` +
      `✅ *A new task has been assigned to you!* ✅\n\n` +
      `📌 *Task Title:* *${title}* \n` +
      `👤 *Assigned By:* ${creator} \n` +
      `🎯 *Assigned To:* ${username} \n` +
      `📅 *Target Date:* ${targetDate} \n\n` +
      `🔗 *Please log in to your account to view the task details.*\n\n` +
      `💡 *Need help? Feel free to reach out!* \n\n` +
      `*Warm regards,*\n` +
      `_The Innovative Study Circle Team_ 💼`,

  taskCompleted: (
    username,
    assignerUsername,
    title,
    targetDate,
    completionDate
  ) =>
    `✨ *Hello ${username},* ✨\n\n` +
    `📢 *Greetings from Innovative Study Circle!* 📢\n\n` +
    `✅ *A task has been completed by ${assignerUsername}!* ✅\n\n` +
    `📌 *Task Title:* *${title}* \n` +
    `👤 *Assigned By:* ${username} \n` +
    `🎯 *Assigned To:* ${assignerUsername} \n` +
    `📅 *Target Date:* ${targetDate} \n\n` +
    `📅 *completion Date:* ${completionDate} \n\n` +
    `🔗 *Please log in to your account to view the task details.*\n\n` +
    `💡 *Need help? Feel free to reach out!* \n\n` +
    `*Warm regards,*\n` +
    `_The Innovative Study Circle Team_ 💼`,

  taskExtensionRequested: (
    username,
    assignerUsername,
    title,
    targetDate,
    taskExtensionRequestedDate
  ) =>
    `✨ *Hello ${username},* ✨\n\n` +
    `📢 *Greetings from Innovative Study Circle!* 📢\n\n` +
    `⏳ *An extension has been requested for a task by ${assignerUsername}.* ⏳\n\n` +
    `📌 *Task Title:* *${title}* \n` +
    `👤 *Assigned By:* ${username} \n` +
    `🎯 *Assigned To:* ${assignerUsername} \n` +
    `📅 *Previous Target Date:* ${targetDate} \n\n` +
    `📅 *taskExtensionRequestedDate:* ${taskExtensionRequestedDate} \n\n` +
    `🔗 *Please log in to your account to review the request.*\n\n` +
    `*Warm regards,*\n` +
    `_The Innovative Study Circle Team_ 💼`,

  taskExtensionStatus: (username, status, title,extendRequestDate,targetDate) =>
    `✨ *Hello ${username},* ✨\n\n` +
    `📢 *Update from Innovative Study Circle!* 📢\n\n` +
    `🔄 *Your task extension request has been *${status.toUpperCase()}*.\n\n` +
    `📌 *Task Title:* *${title}* \n` +
    // `📅 *Previous Target Date:* ${targetDate} \n\n` +
    `📅 *Requested Target Date:* ${extendRequestDate} \n\n` +
    (status === "approved"
      ? `📅 *New Target Date:* ${targetDate} \n\n`
      : "") +
    `🔗 *Please log in to your account for more details.*\n\n` +
    `*Warm regards,*\n` +
    `_The Innovative Study Circle Team_ 💼`,
};

export default whatsappTemplates;
