import * as fs from "fs";
import * as path from "path";

const handler = async (req, res) => {
    if (req.method === "GET") {
        try {
            const fileStream = fs.createReadStream(
                path.resolve("res/user_manual.pdf")
            );
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=user_manual.pdf"
            );
            res.status(200);
            fileStream.pipe(res);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: "Error retrieving file." });
        }
    }
};

export default handler;
