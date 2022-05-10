import * as pdf from "pdf-creator-node";
import * as fs from "fs";
import * as path from "path";

import "firebase-admin.config";
import { getFirestore } from "firebase-admin/firestore";

const tables = ["appointments", "queries"];

async function generateReport(report) {
    if (!tables.includes(report)) {
        throw new Error("Invalid Table Requested!");
    }

    let db = getFirestore();
    let { docs } = await db.collection(report).get();

    let data = docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    let templatePath = null;

    switch (report) {
        case "appointments":
            templatePath = path.resolve("res/appointment_report_template.html");
            break;
        case "queries":
            templatePath = path.resolve("res/query_report_template.html");
            break;
    }

    console.log(templatePath);

    let template = fs.readFileSync(templatePath, "utf-8");

    let pdfOptions = {
        format: "Letter",
        orientation: "landscape",
        border: "10mm",
        footer: {
            height: "1mm",
            contents: `
                <h5 style="text-align: right; color: #777;">
                   ${report.toUpperCase()} | {{page}}
                </h5>
            `,
        },
    };

    let pdfDocument = {
        html: template,
        data: {
            report: data,
        },
        type: "stream",
    };

    return await pdf.create(pdfDocument, pdfOptions);
}

export default generateReport;
