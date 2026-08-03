import express from "express";

const app = express();

app.get("/api/hello", (_, res) => {
    res.json({ message: "Hello!" });
});

app.listen(3000, () => {
    console.log("Listening on :3000");
});
