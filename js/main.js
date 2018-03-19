import { Cloth, mouse } from "./cloth";
import asukakiraran01 from "./asukakiraran01";
import asukakiraran02 from "./asukakiraran02";
import songjoongki01 from "./songjoongki01";

const models = {
  asukakiraran01,
  asukakiraran02,
  songjoongki01,
};

let cloth = null;

const setMouse = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  mouse.px = mouse.x;
  mouse.py = mouse.y;
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
};

const selectModel = (model) => {
  const container = document.getElementById("canvas-container");
  let canvas = document.getElementById("canvas");
  container.removeChild(canvas);

  canvas = document.createElement("canvas");
  canvas.setAttribute("id", "canvas");
  container.appendChild(canvas);
  initCanvas(canvas, model);

  const desc = document.querySelector(".desc a");
  desc.setAttribute("href", model.reference);
  desc.innerHTML = model.name;

  cloth = new Cloth(model, canvas);
};

const initModels = (picker) => {
  Object.keys(models).forEach((model, i) => {
    const img = document.createElement("img");
    img.setAttribute("data-model", model);
    img.setAttribute("src", `./images/${models[model].thumbnail}`);
    img.setAttribute("title", models[model].name);
    img.onclick = (e) => {
      [...document.querySelectorAll(".model-picker img")].forEach((node) => node.classList.remove("selected"));
      e.target.classList.add("selected");
      selectModel(models[e.target.getAttribute("data-model")]);
    }
    if (model === 'songjoongki01') {
    //if (!i) {
      img.classList.add("selected");
      selectModel(models[model]);
    }
    picker.appendChild(img);
  });
};

const initCanvas = (canvas, options) => {

  canvas.width = options.width;
  canvas.height = options.height;
  canvas.style.backgroundImage = `url(./images/${options.image})`;

  canvas.onmousedown = (e) => {
    mouse.button = e.which;
    mouse.down = true;
    setMouse(e, canvas);
  }
  canvas.onmousemove = (e) => setMouse(e, canvas);
  canvas.onmouseup = () => (mouse.down = false);
  canvas.onmouseout = () => (mouse.down = false);
  canvas.oncontextmenu = (e) => e.preventDefault();
};

document.addEventListener("DOMContentLoaded", (e) => {
  initModels(document.querySelector(".model-picker"));

  const animate = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cloth && cloth.update(0.016);
    window.requestAnimationFrame(animate);
  };

  animate();
});
