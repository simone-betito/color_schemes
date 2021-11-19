async function loadData() {
  const data = await d3.csv("data.csv");
  // console.log(data);

  const colorConvert = data.map((x) => {
    let cmyk = x.color.split(",").map((c) => c.trim());
    let converted = cmykToRgb(
      cmyk[0] / 100,
      cmyk[1] / 100,
      cmyk[2] / 100,
      cmyk[3] / 100
    );
    return {
      ...x,
      converted,
    };
  });

  console.log(colorConvert);
}
loadData();

// https://www.w3schools.com/colors/colors_converter.asp
function cmykToRgb(c, m, y, k) {
  var r, g, b;
  r = 255 - Math.min(1, c * (1 - k) + k) * 255;
  g = 255 - Math.min(1, m * (1 - k) + k) * 255;
  b = 255 - Math.min(1, y * (1 - k) + k) * 255;
  return { r: Math.floor(r), g: Math.floor(g), b: Math.floor(b) };
}
