import appContainer from './src/dependency-injection/app-container';
import * as dotenv from "dotenv";
import Kernel from "./src/kernel";
import path from "path";

dotenv.config({path: path.join(__dirname, '.env')})

const kernel: Kernel = appContainer.get(Kernel.name);

kernel.init();
kernel.boot();
