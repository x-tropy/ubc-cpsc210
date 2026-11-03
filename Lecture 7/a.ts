import { readFile } from "fs/promises";

const contents = readFile("report.txt", "utf8");  // returns immediately
console.log(contents);  // prints "Promise { <pending> }", not the file's text

// 只要有可能产生一个 Promise 的地方，都可以用 then 去接着写。链式调用代码更优雅！

// readFile("report.txt", "utf8").then((contents) => {
//     console.log(contents);
// });

// await is syntactic sugar for then
const contents2 = await readFile("report.txt", "utf8");
console.log(contents2)
