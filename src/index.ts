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

  const angleRange = (r0: number, r1: number) => {
    const edgeAngle = p5.asin(r0 / (r0 + r1));
    const aa = (p5.PI - 2 * edgeAngle) / 2;
    return [aa, p5.PI - aa];
  };

  const drawComposition = () => {
    p5.push();
    p5.translate(width / 2, height / 2);
    p5.background("#fafafa");
    p5.stroke("#c9c9c9")
    p5.line(-width / 2, 0, width / 2, 0);
    p5.line(0, -height / 2, 0, height / 2);
    p5.noFill();
    p5.noStroke();
    p5.noLoop();

    // const circles = [50, 40].reduce((acc, r, i) => {
    //   const prevCircle = i === 0 ? { x: 0, y: 0, r: r0 } : acc[i - 1];
    //   const circle = joinCircles(prevCircle, r, p5.frameCount / 1 / r);
    //   return [...acc, circle];
    // }, [] as Circle[]);

    const rs = Array.from({ length: 8 }, (_, i) => fxRandom(10, 100));
    const as = Array.from({ length: 8 }, (_, i) => {
      if (i === 0) return 0;
      const [min, max] = angleRange(rs[i - 1], rs[i]);
      return fxRandom(min, max);
    });

    const circles: Circle[] = rs.reduce((acc: Circle[], r, i) => {
      const prevCircle = i === 0 ? { x: -r*2, y: -height/2 + r + 20, r } : acc[i - 1];
      const circle = joinCircles(prevCircle, r, as[i]);
      return [...acc, circle];
    }, [] as Circle[]);

    circles.forEach((c, i, l) => {
      drawCircle(c)
      if (i === 0) return;
      const c0 = l[i - 1];
      const c1 = l[i];
      drawOrbit(c0, c1);
      drawConnection(c0, c1, "#ff0000");
    });

    // const c0 = { x: 0, y: -height / 2 + r0 + 20, r: r0 };
    // const a1 = angleRange(r0, 50);

    // const c1 = joinCircles(c0, 50, p5.random(a1[0], a1[1]));

    // const a2 = angleRange(50, 40);
    // const c2 = joinCircles(c1, 40, p5.random(a2[0], a2[1]));

    // drawCircle(c0);
    // drawCircle(c1);
    // drawCircle(c2);

    // drawConnection(c0, c1, "#ff0000");
    // drawConnection(c1, c2, "#ff0000");
    // [{ x: 0, y: 0, r: r1 }, ...circles].forEach((c, i, l) => {
    //   if (i === l.length - 1) return;
    //   const c0 = l[i];
    //   const c1 = l[i + 1];
    //   p5.push();
    //   drawCircle(c0);
    //   drawCircle(c1);
    //   drawOrbit(c0, c1);
    //   drawConnection(c0, c1, "#ff0000");
    //   drawConnection(c1, c0, "#0000ff");
    //   p5.pop();
    // });
    // p5.pop();
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
