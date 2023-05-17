import express, { Response, Request } from "express";
import { createClient } from "@libsql/client";

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = createClient({
  url: process.env.NUXT_TURSO_DB_URL as string,
  authToken: process.env.NUXT_TURSO_DB_AUTH_TOKEN as string
});

app.get("/frameworks", async function (req: Request, res: Response) {
  try {


    const rs = await client.execute("select * from frameworks");
    let data = {
      message: "Frameworks fetched!",
      data: {
        frameworks: rs.rows
      }
    };
    res.send(data);
  } catch (e) {
    console.error(e);
    res.send(e);
  }
});

app.get("/:name", async function (req: Request, res: Response) {
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

app.post('/add', async function (req: Request, res: Response) {
  try {
    const { name, language, url, stars } = req.body;

    if (!name || !language || !url || !stars) {
      res.status(400);
      res.json({
        message: "Missing fields!",
        statusCode: 400
      });
      return;
    }

    const response = await client.execute({
      sql: "insert into frameworks(name, language, url, stars) values(?, ?, ?, ?)",
      args: [
        name, language, url, stars,
      ]
    });

    const framework = await client.execute({
      sql: "select * from frameworks where url = ?",
      args: [url]
    })

    let data = {
      message: "Framework added!",
      data: framework.rows,
      value: null
    };
    res.send(data);
  } catch (e: any) {
    res.status(400).json({
      error: {
        value: {
          data: {
            message: e.message,
            code: e.code
          }
        }
      }
    });
  }
});

if (!module.parent) {
  app.listen(3000);
  console.log("Express started on port 3000");
}

export default app;
