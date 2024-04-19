import { Router } from "express";
import { tableData } from "../../controllers/table/index.mjs";

export const tableRoutes = Router();

tableRoutes.get("/data", tableData);
