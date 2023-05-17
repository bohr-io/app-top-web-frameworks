import express, { Response, Request } from "express";
import { createClient } from "@libsql/client";

var app = express();
app.use(express.urlencoded({ extended: true }));

const client = createClient({
  url: "libsql://bohr-willersonsp.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODQzMjU1NTMsImlkIjoiZmIxYTc2ODItZjRhYi0xMWVkLTkxZGQtMDIzNTBmN2M2OTc0In0.KS9kr3iZnBus8_d4ZbNNlfqf-6wbByYghShH3X4OsOQiXuZAh4z4ZYZ33Pmdxz1aVE1w2j6fHU53nxsqLvFQCA"
});

app.get("/", function (req: Request, res: Response) {
  res.send("Turso Bohr template");
});

app.get("/frameworks", async function (req: Request, res: Response) {
  try {
    const rs = await client.execute("select * from frameworks");
    res.send(rs);
  } catch (e) {
    console.error(e);
    res.send(e);
  }
});

app.get("/frameworks/:name", async function (req: Request, res: Response) {
  try {
    const rs = await client.execute({
      sql: "select * from frameworks where name = ?",
      args: [req.params.name]
    });
    res.send(rs);
  } catch (e) {
    console.error(e);
  }
});

app.post('/frameworks/add', async function (req: Request, res: Response) {
  try {
    const { name, language, url, stars } = req.body;

    await client.execute({
      sql: "insert into frameworks(name, language, url, stars) values(?, ?, ?, ?)",
      args: [
        name, language, url, stars,
      ]
    });
    res.send({ "ok": true });
  } catch (e) {
    console.error(e);
  }
});

if (!module.parent) {
  app.listen(3000);
  console.log("Express started on port 3000");
}

export default app;
