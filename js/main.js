import { Cloth, mouse } from "./cloth";
import asukakiraran01 from "./asukakiraran01";
import asukakiraran02 from "./asukakiraran02";

const models = {
  asukakiraran01,
  asukakiraran02,
};

const setMouse = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  mouse.px = mouse.x;
  mouse.py = mouse.y;
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
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

const selectModel = (canvas, model) => {
  const desc = document.querySelector(".desc a");
  initCanvas(canvas, model);

  desc.setAttribute("href", model.reference);
  desc.innerHTML = model.name;

  return model;
}

document.addEventListener("DOMContentLoaded", (e) => {
  const canvas = document.getElementById('canvas');
  const model = selectModel(canvas, models.asukakiraran02);

  const cloth = new Cloth(model, canvas);

  const animate = () => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cloth.update(0.016);
    window.requestAnimationFrame(animate);
  };

  animate();
});
