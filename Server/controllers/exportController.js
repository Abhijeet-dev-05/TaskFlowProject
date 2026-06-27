import prisma from "../configs/prisma.js";
import PDFDocument from "pdfkit";

// Export tasks as CSV
export const exportCSV = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: {
                    include: { assignee: true },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Build CSV
        const headers = ["Title", "Status", "Priority", "Type", "Assignee", "Due Date", "Created At"];
        const rows = project.tasks.map((t) => [
            `"${(t.title || "").replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.type,
            `"${t.assignee?.name || "Unassigned"}"`,
            t.due_date ? new Date(t.due_date).toLocaleDateString() : "N/A",
            new Date(t.createdAt).toLocaleDateString(),
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${project.name}-tasks.csv"`);
        res.send(csv);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// Export tasks as PDF
export const exportPDF = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: {
                    include: { assignee: true },
                    orderBy: { createdAt: "desc" },
                },
                members: { include: { user: true } },
                owner: true,
            },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const doc = new PDFDocument({ margin: 50, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${project.name}-report.pdf"`);
        doc.pipe(res);

        // ── Header ──
        doc.fontSize(22).fillColor("#1e293b").text(project.name, { align: "left" });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor("#64748b").text(
            `Status: ${project.status} | Priority: ${project.priority} | Generated: ${new Date().toLocaleDateString()}`,
            { align: "left" }
        );
        doc.moveDown(0.3);
        if (project.description) {
            doc.fontSize(9).fillColor("#94a3b8").text(project.description, { align: "left" });
        }

        // ── Divider ──
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").lineWidth(1).stroke();
        doc.moveDown(0.8);

        // ── Analytics Summary ──
        const total = project.tasks.length;
        const done = project.tasks.filter((t) => t.status === "DONE").length;
        const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
        const todo = project.tasks.filter((t) => t.status === "TODO").length;
        const overdue = project.tasks.filter(
            (t) => new Date(t.due_date) < new Date() && t.status !== "DONE"
        ).length;
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

        doc.fontSize(13).fillColor("#1e293b").text("Project Summary", { underline: true });
        doc.moveDown(0.4);

        const summaryItems = [
            `Total Tasks: ${total}`,
            `Completed: ${done} (${completionRate}%)`,
            `In Progress: ${inProgress}`,
            `To Do: ${todo}`,
            `Overdue: ${overdue}`,
            `Team Members: ${project.members?.length || 0}`,
        ];

        summaryItems.forEach((item) => {
            doc.fontSize(10).fillColor("#475569").text(`  • ${item}`);
        });

        doc.moveDown(0.8);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").lineWidth(1).stroke();
        doc.moveDown(0.8);

        // ── Tasks Table ──
        doc.fontSize(13).fillColor("#1e293b").text("Task Details", { underline: true });
        doc.moveDown(0.6);

        // Table header
        const tableTop = doc.y;
        const colWidths = [170, 70, 65, 70, 90, 65];
        const colLabels = ["Title", "Status", "Priority", "Type", "Assignee", "Due Date"];
        const colX = [50];
        for (let i = 1; i < colWidths.length; i++) {
            colX.push(colX[i - 1] + colWidths[i - 1]);
        }

        // Header background
        doc.rect(50, tableTop - 4, 495, 20).fillColor("#f1f5f9").fill();

        colLabels.forEach((label, i) => {
            doc.fontSize(8).fillColor("#475569").text(label, colX[i] + 4, tableTop, {
                width: colWidths[i] - 8,
                align: "left",
            });
        });

        doc.moveDown(0.6);
        let rowY = doc.y + 4;

        const statusColors = { TODO: "#6b7280", IN_PROGRESS: "#3b82f6", DONE: "#10b981" };
        const priorityColors = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

        project.tasks.forEach((task, idx) => {
            // Check page break
            if (rowY > 740) {
                doc.addPage();
                rowY = 50;
            }

            // Alternate row bg
            if (idx % 2 === 0) {
                doc.rect(50, rowY - 3, 495, 18).fillColor("#fafafa").fill();
            }

            const rowData = [
                (task.title || "").substring(0, 30) + (task.title?.length > 30 ? "..." : ""),
                task.status.replace("_", " "),
                task.priority,
                task.type,
                (task.assignee?.name || "Unassigned").substring(0, 14),
                task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A",
            ];

            rowData.forEach((val, i) => {
                let color = "#334155";
                if (i === 1) color = statusColors[task.status] || color;
                if (i === 2) color = priorityColors[task.priority] || color;

                doc.fontSize(8).fillColor(color).text(val, colX[i] + 4, rowY, {
                    width: colWidths[i] - 8,
                    align: "left",
                });
            });

            rowY += 20;
        });

        // ── Footer ──
        doc.moveDown(2);
        doc.fontSize(8)
            .fillColor("#94a3b8")
            .text(`TaskFlow Report — Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50, {
                align: "center",
            });

        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
