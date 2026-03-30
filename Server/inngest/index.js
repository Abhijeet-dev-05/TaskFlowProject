import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import { sendEmail } from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Task-Flow" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
    async ({ event }) => {
        const { data } = event;

        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            },
        });
    }
);

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk", triggers: [{ event: "clerk/user.deleted" }] },
    async ({ event }) => {
        const { data } = event;

        await prisma.user.delete({
            where: {
                id: data.id,
            },
        });
    }
);

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk", triggers: [{ event: "clerk/user.updated" }] },
    async ({ event }) => {
        const { data } = event;

        await prisma.user.update({
            where: {
                id: data.id,
            },
            data: {
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            },
        });
    }
);



// Inngest Function to save workspace data to database
const syncWorkspaceCreation = inngest.createFunction(
    { id: "sync-workspace-from-clerk", triggers: [{ event: "clerk/organization.created" }] },
    async ({ event }) => {
        const { data } = event;

        // Create workspace
        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url,
            },
        });

        // Add creator as ADMIN member
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN",
            },
        });
    }
);


// Inngest function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
    { id: "update-workspace-from-clerk", triggers: [{ event: "clerk/organization.updated" }] },
    async ({ event }) => {
        const { data } = event;

        await prisma.workspace.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
            },
        });
    }
);





// Inngest function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
    { id: "delete-workspace-with-clerk", triggers: [{ event: "clerk/organization.deleted" }] },
    async ({ event }) => {
        const { data } = event;

        await prisma.workspace.delete({
            where: {
                id: data.id,
            },
        });
    }
);


// Inngest function to add workspace member
const syncWorkspaceMemberCreation = inngest.createFunction(
    { id: "sync-workspace-member-from-clerk", triggers: [{ event: "clerk/organizationInvitation.accepted" }] },
    async ({ event }) => {
        const { data } = event;

        await prisma.workspaceMember.create({
            data: {
                userId: data.user_id,
                workspaceId: data.organization_id,
                role: String(data.role_name).toUpperCase(),
            },
        });
    }
);



// Inngest Function to Send Email on Task Creation
export const sendTaskAssignmentEmail = inngest.createFunction(
    {
        id: "send-task-assignment-mail",
        triggers: [{ event: "app/task.assigned" }],
    },
    async ({ event, step }) => {
        const { taskId, origin } = event.data;

        // Get task with assignee + project
        const task = await step.run("fetch-task", async () => {
            return await prisma.task.findUnique({
                where: { id: taskId },
                include: { assignee: true, project: true },
            });
        });

        if (!task || !task.assignee) return;

        // Send assignment email
        await step.run("send-assignment-email", async () => {
            await sendEmail({
                to: task.assignee.email,
                subject: `New Task Assignment in ${task.project.name}`,
                body: `
        <div style="max-width: 600px;">
          <h2>Hi ${task.assignee.name},</h2>

          <p style="font-size: 16px;">
            You've been assigned a new task:
          </p>

          <p style="font-size: 18px; font-weight: bold; color: #007bff;">
            ${task.title}
          </p>

          <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
          </div>

          <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; text-decoration: none;">
            View Task
          </a>

          <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            Please make sure to review and complete it before the due date.
          </p>
        </div>
      `,
            });
        });

        // Wait until due date
        if (
            task.due_date &&
            new Date(task.due_date).toDateString() !== new Date().toDateString()
        ) {
            await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));

            // Check again if task is completed
            const updatedTask = await step.run("check-if-task-is-completed", async () => {
                return await prisma.task.findUnique({
                    where: { id: taskId },
                    include: { assignee: true, project: true },
                });
            });

            if (!updatedTask) return;

            // Send reminder if not done
            if (updatedTask.status !== "DONE") {
                await step.run("send-task-reminder-mail", async () => {
                    await sendEmail({
                        to: updatedTask.assignee.email,
                        subject: `Reminder for ${updatedTask.project.name}`,
                        body: `
                <div style="max-width: 600px;">
                  <h2>Hi ${updatedTask.assignee.name},</h2>

                  <p style="font-size: 16px;">
                    You have a pending task:
                  </p>

                  <p style="font-size: 18px; font-weight: bold; color: #007bff;">
                    ${updatedTask.title}
                  </p>

                  <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
                    <p><strong>Description:</strong> ${updatedTask.description}</p>
                    <p><strong>Due Date:</strong> ${new Date(updatedTask.due_date).toLocaleDateString()}</p>
                  </div>

                  <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; text-decoration: none;">
                    View Task
                  </a>

                  <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
                    Please complete it as soon as possible.
                  </p>
                </div>
              `,
                    });
                });
            }
        }
    }
);


// Export our functions so they can be registered with Inngest
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,
    sendTaskAssignmentEmail,
];