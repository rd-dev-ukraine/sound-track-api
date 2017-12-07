import * as express from "express";
import * as bodyParser from "body-parser";

import usersRouter from "./routes/users";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const router = express.Router();

router.use("/users", usersRouter);

app.use('/api', router);
app.listen(port, () => {
    console.log("Server started");
});
