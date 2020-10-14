const madge = require('madge');
const fs = require('fs');
let outputsvg;
madge('src/scene/2D/ViewObject/Column2D.ts').then((res) => res.svg())
  .then((output) => {
    outputsvg = output.toString();
    fs.writeFile("madge.svg", outputsvg, error => {
      if (error) return console.log("写入文件失败,原因是" + error.message);
      console.log("写入成功");
    });
  });

