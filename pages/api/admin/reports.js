import withCSRF from "@/lib/middlewares/withCSRF";
import generateReport from "@/lib/pdfReport";

const handler = async (req, res) => {
    if (req.method === "POST") {
        const { report } = req.body;
        console.log(report);
        try {
            let currentDate = new Date().toISOString().split("T")[0];
            let dataStream = await generateReport(report);
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=ASEA_${report.toUpperCase()}_${currentDate}.pdf`
            );
            res.status(200);
            dataStream.pipe(res);
        } catch (err) {
            console.log(err);
            res.status(418).json({
                msg: "An error has occured generating report.",
            });
        }
    } else {
        res.status(404).json({ msg: "Route doesn't exist." });
    }
};

export default withCSRF(handler);
