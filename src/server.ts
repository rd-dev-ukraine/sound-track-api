import * as express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";

import { connectToDb } from "./database/mongo";

import usersRouter from "./routes/users";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const router = express.Router();

router.use("/users", usersRouter);

app.use('/api', router);

connectToDb().then(_ => {
    app.listen(port, () => {
        console.log("Server started");
    });
})

