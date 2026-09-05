import express from "express";
import cors from "cors";
import { createEmi, deleteEmi, listEmis, toggleEmi } from "./database/db.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/emis", (_request, response) => response.json(listEmis()));

app.post("/api/emis", (request, response) => {
  const { name, amount, category, date } = request.body;
  if (
    !name?.trim() ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !category ||
    !date
  ) {
    return response
      .status(400)
      .json({
        error: "Name, positive amount, category, and date are required.",
      });
  }
  return response
    .status(201)
    .json(
      createEmi({ name: name.trim(), amount: Number(amount), category, date }),
    );
});

app.patch("/api/emis/:id/toggle", (request, response) => {
  const emi = toggleEmi(Number(request.params.id));
  return emi
    ? response.json(emi)
    : response.status(404).json({ error: "EMI not found." });
});

app.delete("/api/emis/:id", (request, response) => {
  const deleted = deleteEmi(Number(request.params.id));
  return deleted
    ? response.status(204).end()
    : response.status(404).json({ error: "EMI not found." });
});

app.listen(port, () =>
  console.log(`EMI API running at http://localhost:${port}`),
);
