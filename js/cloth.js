import _ from "lodash";

export const settings = {
  color: "black",
  accuracy: 5,
  gravity: [0, 300],
  spacing: 8,
  tearDist: 60,
  friction: 0.99,
  bounce: 0.5,
  startX: null,
  startY: null,
};

export const mouse = {
  cut: 8,
  influence: 26,
  down: false,
  button: 1,
  x: 0,
  y: 0,
  px: 0,
  py: 0
};

export class Point {
  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.vx = 0;
    this.vy = 0;
    this.pinX = null;
    this.pinY = null;

    this.constraints = [];
    this.attached = [];

    this.canvas = canvas;
  }

  update(delta) {
    if (this.pinX && this.pinY) return this;

    if (mouse.down) {
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (mouse.button === 1 && dist < mouse.influence) {
        this.px = this.x - (mouse.x - mouse.px);
        this.py = this.y - (mouse.y - mouse.py);
      } else if (dist < mouse.cut) {
        this.constraints = [];
        this.attached = [];
      }
    }

    this.addForce(settings.gravity);

    const nx = this.x + (this.x - this.px) * settings.friction + this.vx * delta;
    const ny = this.y + (this.y - this.py) * settings.friction + this.vy * delta;

    this.px = this.x;
    this.py = this.y;

    this.x = nx;
    this.y = ny;

    this.vy = this.vx = 0;

    if (this.x >= this.canvas.width) {
      this.px = this.canvas.width + (this.canvas.width - this.px) * settings.bounce;
      this.x = this.canvas.width;
    } else if (this.x <= 0) {
      this.px *= -1 * settings.bounce;
      this.x = 0;
    }

    if (this.y >= this.canvas.height) {
      this.py = this.canvas.height + (this.canvas.height - this.py) * settings.bounce;
      this.y = this.canvas.height;
    } else if (this.y <= 0) {
      this.py *= -1 * settings.bounce;
      this.y = 0;
    }

    return this;
  }

  draw() {
    let i = this.constraints.length;
    while (i--) this.constraints[i].draw();

    const area = [];
    for (let j=0; j<this.attached.length; j++) {
      for (let k=j+1; k<this.attached.length; k++) {
        const a1 = this.attached[j].attached;
        const a2 = this.attached[k].attached;
        a1.forEach((p3) => {
          a2.forEach((p4) => {
            if (p3 === p4 && p3 !== this) area.push({ p1: this.attached[j], p2: this.attached[k], p3, p4: this });
          });
        });
      }
    }

    const ctx = this.canvas.getContext("2d");
    area.forEach((a) => {
      ctx.fillStyle = settings.color;
      ctx.strokeStyle = settings.color;
      ctx.beginPath();
      ctx.moveTo(a.p4.x, a.p4.y);
      ctx.lineTo(a.p1.x, a.p1.y);
      ctx.lineTo(a.p3.x, a.p3.y);
      ctx.lineTo(a.p2.x, a.p2.y);
      ctx.closePath();
      ctx.fill();
    });
  }

  resolve() {
    if (this.pinX && this.pinY) {
      this.x = this.pinX;
      this.y = this.pinY;
      return;
    }

    this.constraints.forEach((constraint) => constraint.resolve());
  }

  attach(point) {
    this.constraints.push(new Constraint(this, point, this.canvas));
    this.attached.push(point);
  }

  free(constraint) {
    this.constraints.splice(this.constraints.indexOf(constraint), 1);
    const point = constraint.p1 === this ? constraint.p2 : constraint.p1;
    this.attached.splice(this.attached.indexOf(point), 1);
  }

  addForce(force) {
    const [x, y] = force;
    this.vx += _.isFunction(x) ? x() : x;
    this.vy += _.isFunction(y) ? y() : y;
  }

  pin(pinx, piny) {
    this.pinX = pinx;
    this.pinY = piny;
  }

  getAttached() {
    return this.constraints.reduce((list, constraint) => list.concat(constraint.p1 === this ? constraint.p2 : constraint.p1), []);
  }
}

export class Constraint {
  constructor(p1, p2, canvas) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = settings.spacing;
    this.canvas = canvas;
  }

  resolve() {
    const dx = this.p1.x - this.p2.x;
    const dy = this.p1.y - this.p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.length) return;

    const diff = (this.length - dist) / dist;

    if (dist > settings.tearDist) this.p1.free(this);

    let mul = diff * 0.5 * (1 - this.length / dist);

    const px = dx * mul;
    const py = dy * mul;

    !this.p1.pinX && (this.p1.x += px);
    !this.p1.pinY && (this.p1.y += py);
    !this.p2.pinX && (this.p2.x -= px);
    !this.p2.pinY && (this.p2.y -= py);

    return this;
  }

  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.strokeStyle = settings.color;
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
  }
}

export class Cloth {
  constructor(options, canvas) {
    this.points = [];
    this.canvas = canvas;

    _.merge(settings, options);

    const clothes = settings.points;
    const pointss = [];

    for (let y = 0; y < clothes.length; y++) {
      const points = [];
      const row = clothes[y];
      let base = 0;
      row.forEach((r) => {
        if (r) {
          for (let x = 0; x <= Math.abs(r); x++) {
            const point = new Point(settings.startX + (base+x) * settings.spacing, settings.startY + y * settings.spacing, canvas);
            (r > 0) && point.pin(point.x, point.y);
            points.push(point);
            this.points.push(point);
          }
          base += Math.abs(r);
        } else {
          points.push(null);
          base++;
        }
      });
      pointss.push(points);
    }

    for (let y = 0; y < pointss.length; y++) {
      const points = pointss[y];
      for (let x = 0; x < points.length; x++) {
        const point = points[x];
        if (point) {
          (x > 0 && points[x-1]) && point.attach(points[x-1]);
          (y > 0 && pointss[y-1] && pointss[y-1][x]) && point.attach(pointss[y-1][x]);
        }
      }
    }
  }

  update(delta) {
    let i = settings.accuracy;

    while (i--) {
      this.points.forEach((point) => {
        point.resolve();
      });
    }

    const ctx = this.canvas.getContext("2d");
    ctx.beginPath();
    this.points.forEach((point) => {
      point.update(delta * delta).draw();
    });
    ctx.strokeStyle = settings.color;
    ctx.stroke();
  }
}
