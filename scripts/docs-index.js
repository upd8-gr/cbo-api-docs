const fs = require("fs");
const path = require("path");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>API Docs</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;}
    a{display:block;margin:12px 0;font-size:18px;}
    small{color:#666}
  </style>
</head>
<body>
  <h1>API Documentation</h1>
  <p>Select a version:</p>
  <a href="./v1/">OpenAPI v1</a>
  <a href="./v1.1/">OpenAPI v1.1</a>
  <hr />
  <small>Published via GitHub Pages</small>
</body>
</html>`;

// const css = `
// <style>
//   .nav{
//     display:flex;
//     align-items:center;
//     justify-content:space-between;
//     padding:14px 26px;
//     background:#f6f7f9;
//     border-bottom:1px solid #e5e7eb;

//     position: sticky;
//     top: 0;
//     z-index: 9999;
//   }
// </style>
// `;

fs.mkdirSync(path.join("dist"), { recursive: true });
fs.writeFileSync(path.join("dist", "index.html"), html);
console.log("dist/index.html generated");