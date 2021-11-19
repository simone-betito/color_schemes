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
  //const xAccessor = d => d.brightness
  //const yAccessor = d => d.saturation

  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );
  const xScale = d3.scaleLinear();
  const yScale = d3.scaleLinear();

  bounds
    .append("rect")
    .attr("x", dimensions.boundedHeight / 2)
    .attr("y", dimensions.boundedHeight / 2);
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
