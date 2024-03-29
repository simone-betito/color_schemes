const catName = {
  "art-history": "Art History",
  "contemporary-art": "Contemporary Art",
  "pop-culture": "Pop Culture",
};

async function loadData() {
  const rawData = await d3.csv("data.csv");
  // console.log(rawData);

  const data = rawData
    .map((x) => {
      let cmyk = x.color.split(",").map((c) => c.trim());
      let converted = cmykToRgb(
        cmyk[0] / 100,
        cmyk[1] / 100,
        cmyk[2] / 100,
        cmyk[3] / 100
      );

      const convertToHsl = RGBToHSL(converted.r, converted.g, converted.b);
      const finalColor = d3.hsl(convertToHsl);
      return {
        ...x,
        converted,
        finalColor,
        convertToHsl,
      };
    })
    .sort((a, b) => {
      return b.finalColor.h - a.finalColor.h;
    });

  console.log(data);
  const xAccessor = (d) => d.finalColor.s;
  const yAccessor = (d) => d.finalColor.l;

  const width = d3.min([window.innerWidth * 0.975, window.innerHeight * 0.975]);

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 20,
      bottom: 50,
      left: 50,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const chart = d3
    .select("#chart")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = chart
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );
  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, dimensions.boundedWidth])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([dimensions.boundedHeight, 0])
    .nice();

  const squares = bounds.selectAll("rect").data(data);

  squares
    .join("rect")
    .attr("transform", (d) => {
      if (!d.finalColor.s || !d.finalColor.l) return;
      return `translate(${xScale(xAccessor(d))} ${yScale(yAccessor(d))})`;
    })
    .attr("width", 10)
    .attr("height", 10)
    .attr("data-color", (d) => d.finalColor.l)
    .style("fill", (d) => d.finalColor)
    .style("stroke", "#fff")
    .style("stroke-width", 0.5)
    .attr("class", (d) => {
      return `square ${d.category}`;
    })
    .on("mouseover", function (event, d) {
      // bounds.selectAll(".square").style("opacity", 0.3);
      // d3.select(this).style("border-color", (d) => d.finalColor);
      return showTooltip(d, event);
    })
    .on("mouseleave", () => {
      // bounds.selectAll(".square").style("opacity", 1);
      return hideTooltip();
    });

  //Axis
  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "#eee")
    .style("font-family", "playfair display")
    .style("font-size", "1.4em")
    .html("Saturation");

  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(10);
  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .attr("fill", "#eee")
    .style("font-size", "1.4em")
    .text("Lightness")
    .style("font-family", "playfair display")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle");

  // labels
  document.querySelectorAll(".label-wrapper div").forEach((label) => {
    label.addEventListener("mouseover", (e) => {
      let category = e.target.dataset.cat;

      bounds.selectAll(".square").style("opacity", 0.1);
      bounds.selectAll(`.${category}`).style("opacity", 1);
    });
    label.addEventListener("mouseleave", () => {
      bounds.selectAll(".square").style("opacity", 1);
    });
  });
}

const tooltip = d3.select(".tooltip");

function showTooltip(d, event) {
  const { clientX, clientY } = event;
  const { topic, name, color, page, category, convertToHsl } = d;
  tooltip
    .style("opacity", 1)
    .style("border-color", convertToHsl)
    .style("left", `${clientX - 100}px`)
    .style("top", `${clientY + 50}px`).html(`
    <div class="topic">${topic}</div>
    <div class="nameOfObject">${name}</div>
    <div class="cmyk"><b>CMYK:</b> ${color}</div>
    <div><b>Page Number:</b> ${page}</div>
    <div><b>Category:</b> ${catName[category]}</div>
    `);
}
let hideTooltip = () => tooltip.style("opacity", 0);

loadData();

const title = document.querySelector("h1 span");
const titleText = "Color Scheme";
titleText.split("").forEach((x, i) => {
  title.innerHTML += `<span style="color: ${generateColor()}">${x}</span>`;
});

function generateColor() {
  let colorSet = [
    "pink",
    "#b69034",
    "poppy",
    "#c6e8c9",
    "orange",
    "#c2c2c2",
    "coral",
    "teal",
    "#e9bd53",
    "#a091dd",
    "#db93c9",
    "#48def2",
    "#f3de61",
    "#7a5eee",
    "#ccc3ec",
    "#e26069",
    "#a0c1f7",
    "#c1d6ad",
  ];
  let colorAccess = Math.floor(Math.random() * colorSet.length);
  return colorSet[colorAccess];
}
// utilities
// https://www.w3schools.com/colors/colors_converter.asp
function cmykToRgb(c, m, y, k) {
  var r, g, b;
  r = 255 - Math.min(1, c * (1 - k) + k) * 255;
  g = 255 - Math.min(1, m * (1 - k) + k) * 255;
  b = 255 - Math.min(1, y * (1 - k) + k) * 255;
  return { r: Math.floor(r), g: Math.floor(g), b: Math.floor(b) };
}
//https://css-tricks.com/converting-color-spaces-in-javascript/
function RGBToHSL(r, g, b) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;
  // Calculate hue
  // No difference
  if (delta == 0) h = 0;
  // Red is max
  else if (cmax == r) h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g) h = (b - r) / delta + 2;
  // Blue is max
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return "hsl(" + h + "," + s + "%," + l + "%)";
}
