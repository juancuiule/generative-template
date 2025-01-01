import * as P5 from "p5";

declare function fxrand(): number;
declare const fxhash: string;
declare const window: Window &
  typeof globalThis & {
    $fxhashFeatures: Record<string, string | number | boolean>;
  };

function fxRandom(min?: number | any[], max?: number) {
  if (typeof min === "undefined") {
    return fxrand() as number;
  } else if (typeof max === "undefined") {
    if (min instanceof Array) {
      return min[Math.floor(fxrand() * min.length)];
    } else {
      return (fxrand() * min) as number;
    }
  } else if (typeof min === "number" && typeof max === "number") {
    const _min = min > max ? max : min;
    const _max = min > max ? min : max;
    return (fxrand() * (_max - _min) + _min) as number;
  }
}

type Circle = {
  x: number;
  y: number;
  r: number;
};

const sketch = (p5: P5) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  const joinCircles = (
    originCircle: Circle,
    r: number,
    angle: number
  ): Circle => {
    const x = originCircle.x + (originCircle.r + r) * p5.cos(angle);
    const y = originCircle.y + (originCircle.r + r) * p5.sin(angle);
    return { x, y, r };
  };

  const r0 = 100;

  const setRandomValues = () => {};

  const cs = Array.from({ length: 2 }, (_, i) => {
    const a = 0 * fxRandom(0, p5.TAU);
    const r = fxRandom(25, 60);
    return { a, r };
  });

  const drawCircle = ({ x, y, r }: { x: number; y: number; r: number }) => {
    p5.push();
    p5.stroke("#1d1d1d");
    p5.circle(x, y, r * 2);
    p5.circle(x, y, 10);

    p5.stroke("#c9c9c9");
    p5.line(x - r, y, x + r, y);
    p5.line(x, y - r, x, y + r);
    // const a = p5.TAU / 8;
    // p5.line(x, y, x + r * p5.cos(a), y + r * p5.sin(a));
    // p5.line(x, y, x + r * p5.cos(a * 3), y + r * p5.sin(a * 3));
    // p5.line(x, y, x + r * p5.cos(a * 5), y + r * p5.sin(a * 5));
    // p5.line(x, y, x + r * p5.cos(a * 7), y + r * p5.sin(a * 7));
    p5.pop();
  };

  const drawOrbit = (c0: Circle, c1: Circle) => {
    p5.push();
    p5.stroke("#c9c9c9");
    p5.circle(c0.x, c0.y, (c0.r + c1.r) * 2);
    p5.pop();
  };

  const drawConnection = (
    c0: Circle,
    c1: Circle,
    color: string = "#ff0000"
  ) => {
    p5.push();
    p5.stroke("#c9c9c9");
    p5.line(c0.x, c0.y, c1.x, c1.y);

    p5.stroke(color);
    const dx = c1.x - c0.x;
    const dy = c1.y - c0.y;
    const directionAngle = p5.atan2(dy, dx);

    const edgeAngle = p5.asin(c0.r / (c0.r + c1.r));
    // const aa = (p5.PI - 2 * edgeAngle) / 2
    // alert(aa / p5.TAU * 360)

    const l = p5.sqrt((c0.r + c1.r) ** 2 - c0.r ** 2);

    const a1 = directionAngle - p5.PI + edgeAngle;
    const x1 = c1.x + p5.cos(a1) * l;
    const y1 = c1.y + p5.sin(a1) * l;
    p5.stroke("green");
    p5.line(c1.x, c1.y, x1, y1);
    p5.line(c0.x, c0.y, x1, y1);

    const a2 = directionAngle - p5.PI - edgeAngle;
    const x2 = c1.x + p5.cos(a2) * l;
    const y2 = c1.y + p5.sin(a2) * l;
    p5.stroke("blue");
    p5.line(c1.x, c1.y, x2, y2);
    p5.line(c0.x, c0.y, x2, y2);
    p5.pop();
  };

  const angleRange = (c0: Circle, c1: Circle, r: number) => {
    const directionAngle = p5.atan2(c0.y - c1.y, c0.x - c1.x);
    const edgeAngle = p5.asin(c0.r / (c0.r + c1.r));
    const arcRange = p5.TAU - edgeAngle * 2;

    const ai = directionAngle + edgeAngle;
    const af = ai + arcRange;
    const a0 = p5.acos(c1.r / (c1.r + r));

    return [ai + a0, af - a0];
  };

  const angleBetween = (cPrev: Circle, cCurr: Circle, cNext: Circle) => {
    const _pa = p5.atan2(cPrev.y - cCurr.y, cPrev.x - cCurr.x);
    const _na = p5.atan2(cNext.y - cCurr.y, cNext.x - cCurr.x);
    const pa = _pa < 0 ? p5.TAU + _pa : _pa;
    const na = _na < 0 ? p5.TAU + _na : _na;
    return p5.abs(na - pa);
  };

  const drawComposition = () => {
    p5.push();
    p5.translate(width / 2, height / 2);
    p5.background("#fafafa");
    p5.stroke("#c9c9c9");
    p5.line(-width / 2, 0, width / 2, 0);
    p5.line(0, -height / 2, 0, height / 2);
    p5.noFill();
    p5.noStroke();
    p5.noLoop();

    const N = 5;

    const rs = [100, 50, 40, 30, 20, 40, 100];
    const a1 = fxRandom(0, p5.TAU);
    const c0 = { x: 0, y: 0, r: rs[0] };
    const c1 = joinCircles(c0, rs[1], a1);

    const circles = [c0, c1];
    let prev: Circle = c0;
    let curr: Circle = c1;
    for (let i = 0; i < rs.length - 2; i++) {
      const [min, max] = angleRange(prev, curr, rs[i + 2]);
      const a = fxRandom(min, max);
      const c = joinCircles(curr, rs[i + 2], a);
      circles.push(c);
      prev = curr;
      curr = c;
    }

    const [last] = circles.slice(-1);
    const [first] = circles;

    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const distance = p5.sqrt(dx ** 2 + dy ** 2);

    const x = first.x + dx / 2;
    const y = first.y + dy / 2;
    const r = (distance - last.r - first.r) / 2;
    circles.push({ x, y, r });
    
    circles.forEach((circle, i, l) => {
      drawCircle(circle);
      if (i < l.length - 1) {
        drawConnection(circle, l[i + 1]);
      }
      if (i === l.length - 1) {
        drawConnection(circle, l[0]);
      }
    });

    

    // circles.forEach((circle, i, l) => {
    //   if (i !== 0 && i <= l.length - 2) {
    //     const prev = l[i - 1];
    //     const next = l[i + 1];
    //     const angle = angleBetween(prev, circle, next);
    //     console.log((angle / p5.TAU) * 360);
    //   }
    // });
  };

  p5.setup = () => {
    const canvas = p5.createCanvas(width, height);
    canvas.parent("app");
    setRandomValues();
  };

  // p5.mouseClicked = () => {
  //   // @ts-ignore
  //   if (p5.isLooping()) {
  //     p5.noLoop();
  //   } else {
  //     p5.loop();
  //   }
  // };

  p5.draw = () => {
    drawComposition();
  };
};

new P5(sketch);
