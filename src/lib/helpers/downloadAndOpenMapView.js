// adapted for atlascope from https://openlayers.org/en/latest/examples/export-map.html

import html2canvas from "html2canvas";

export const downloadMapView = (map) => {
  console.log(map);
  map.once("rendercomplete", function () {
    const mapCanvas = document.createElement("canvas");
    const size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext("2d");
    Array.prototype.forEach.call(
      map.getViewport().querySelectorAll(".ol-layer canvas, canvas.ol-layer"),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity =
            canvas.parentNode.style.opacity || canvas.style.opacity;
          mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
          let matrix;
          const transform = canvas.style.transform;
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(",")
              .map(Number);
          } else {
            matrix = [
              parseFloat(canvas.style.width) / canvas.width,
              0,
              0,
              parseFloat(canvas.style.height) / canvas.height,
              0,
              0,
            ];
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          );
          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    const link = document.getElementById("image-download");
    // @ts-ignore
    link.href = mapCanvas.toDataURL();
    link.click();
  });
  map.renderSync();
};

export const openMapView = (map) => {
  let postText = document.getElementById("postText").innerHTML;
  let postDate = document.getElementById("postDate").innerHTML;

  map.once("rendercomplete", function () {
    const mapCanvas = map.getViewport().querySelector("canvas");

    // Convert map canvas → dataURL
    const mapImage = mapCanvas.toDataURL("image/png");

    // Build a temporary container with your layout
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.padding = "1rem";
    wrapper.style.background = "blue"; // ensures clean background

    // Add custom divs
    const header = document.createElement("div");
    header.textContent = postDate;
    header.className = "text-lg font-bold mb-10"; // Tailwind-like

    const image = document.createElement("img");
    image.src = mapImage;
    image.style.maxWidth = "100%";

    const footer = document.createElement("div");
    footer.textContent = postText;
    footer.className = "text-base mt-2";

    wrapper.appendChild(header);
    wrapper.appendChild(image);
    wrapper.appendChild(footer);

    // Append off-screen so html2canvas can render it
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    document.body.appendChild(wrapper);

    // Render wrapper → canvas
    html2canvas(wrapper).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank"); // open in new tab
        }
        document.body.removeChild(wrapper); // cleanup
      });
    });
  });

  map.renderSync();
};

