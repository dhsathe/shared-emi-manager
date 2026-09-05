import { getStore } from "@netlify/blobs";

const store = getStore("emi-group");
const headers = { "Content-Type": "application/json" };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

async function readEmis() {
  return (await store.get("emis", { type: "json" })) || [];
}

async function writeEmis(emis) {
  await store.setJSON("emis", emis);
}

export default async function handler(request) {
  const path = new URL(request.url).pathname.split("/").filter(Boolean);
  const resource = path[3];
  const action = path[4];
  const id = Number(resource);

  if (request.method === "GET" && !resource) {
    const emis = await readEmis();
    return json(emis.sort((first, second) =>
      first.date.localeCompare(second.date) || first.id - second.id));
  }

  if (request.method === "POST" && !resource) {
    const { name, amount, category, date } = await request.json();
    if (
      !name?.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !category ||
      !date
    ) {
      return json(
        { error: "Name, positive amount, category, and date are required." },
        400,
      );
    }
    const emis = await readEmis();
    const emi = {
      id: Date.now(),
      name: name.trim(),
      amount: Number(amount),
      category,
      date,
      status: "pending",
    };
    await writeEmis([...emis, emi]);
    return json(emi, 201);
  }

  const emis = await readEmis();
  const index = emis.findIndex((emi) => emi.id === id);
  if (index < 0) return json({ error: "EMI not found." }, 404);

  if (request.method === "PATCH" && action === "toggle") {
    const updated = {
      ...emis[index],
      status: emis[index].status === "paid" ? "pending" : "paid",
    };
    emis[index] = updated;
    await writeEmis(emis);
    return json(updated);
  }

  if (request.method === "DELETE" && !resource) {
    emis.splice(index, 1);
    await writeEmis(emis);
    return new Response(null, { status: 204 });
  }

  return json({ error: "Method not allowed." }, 405);
}